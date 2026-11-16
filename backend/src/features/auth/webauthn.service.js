// backend/src/features/auth/webauthn.service.js
// Servicio WebAuthn / Passkeys + Confirmación Step-Up para Administrador

import jwt from "jsonwebtoken";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { getJWTSecret, isProduction } from "../../config/env.js";
import { authRepository } from "./auth.repository.js";
import {
  AuthServiceError,
  issueSessionForUser,
  resolveUserFlagsAndRole,
  verifyUserPasswordSecret,
} from "./auth.service.js";
import { webauthnRepository } from "./webauthn.repository.js";

const RP_NAME = process.env.WEBAUTHN_RP_NAME || "D'Piero POS";
const LOCALHOST_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// AAGUIDs oficiales de Microsoft Windows Hello (TPM Hardware, VBS Hardware, Software).
// Se bloquean explícitamente en backend para impedir su registro aun fuera de la UI.
const WINDOWS_HELLO_AAGUIDS = new Set([
  "08987058-cadc-4b81-b6e1-30de50dcbe96",
  "9ddd1817-af5a-4672-a2b9-3e3dd95000a9",
  "6028b017-b1d4-4c02-b4b3-afcdafc96bb2",
]);

function normalizeAaguid(value) {
  return String(value || "").trim().toLowerCase();
}

export function isWindowsDesktopUserAgent(userAgent = "") {
  const ua = String(userAgent || "").trim().toLowerCase();
  if (!ua) return false;
  if (ua.includes("windows phone")) return false;
  return /windows nt|win64|wow64/.test(ua);
}

function assertNonWindowsWebAuthnClient(userAgent) {
  if (isWindowsDesktopUserAgent(userAgent)) {
    throw new AuthServiceError(
      "Windows Hello está deshabilitado por seguridad en equipos PC/Windows. Usa tu contraseña, PIN o un lector físico dedicado.",
      403,
      { code: "DESKTOP_BIOMETRICS_DISABLED" }
    );
  }
}

// Rate-limiter ligero en memoria para validación de correo (Admin paso 1)
const emailCheckWindows = new Map();
const EMAIL_CHECK_WINDOW_MS = 60 * 1000;
const EMAIL_CHECK_MAX_REQUESTS = 25;

function enforceEmailCheckRateLimit(clientKey) {
  const now = Date.now();
  const prev = emailCheckWindows.get(clientKey) || [];
  const recent = prev.filter((ts) => now - ts < EMAIL_CHECK_WINDOW_MS);

  if (recent.length >= EMAIL_CHECK_MAX_REQUESTS) {
    throw new AuthServiceError(
      "Demasiadas verificaciones de correo en poco tiempo. Espera unos segundos.",
      429,
      { code: "EMAIL_CHECK_RATE_LIMITED", retryAfterSeconds: 60 }
    );
  }

  recent.push(now);
  emailCheckWindows.set(clientKey, recent);

  if (emailCheckWindows.size > 500) {
    for (const [key, timestamps] of emailCheckWindows.entries()) {
      if (timestamps.every((ts) => now - ts >= EMAIL_CHECK_WINDOW_MS)) {
        emailCheckWindows.delete(key);
      }
    }
  }
}

function getAllowedOriginsSet() {
  const allowed = new Set();
  if (process.env.FRONTEND_URL) {
    allowed.add(process.env.FRONTEND_URL.trim().replace(/\/+$/, ""));
  }
  if (process.env.WEBAUTHN_ALLOWED_ORIGINS) {
    for (const entry of process.env.WEBAUTHN_ALLOWED_ORIGINS.split(",")) {
      const normalized = entry.trim().replace(/\/+$/, "");
      if (normalized) allowed.add(normalized);
    }
  }
  return allowed;
}

export function resolveWebAuthnContext(requestOrigin) {
  const allowedSet = getAllowedOriginsSet();
  const candidate = (requestOrigin || "").trim().replace(/\/+$/, "");

  let origin = candidate;
  if (!origin) {
    if (process.env.FRONTEND_URL) {
      origin = process.env.FRONTEND_URL.trim().replace(/\/+$/, "");
    } else if (!isProduction) {
      origin = "http://localhost:5173";
    }
  }

  if (!origin) {
    throw new AuthServiceError("No se pudo determinar el origen seguro para biometría", 400);
  }

  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    throw new AuthServiceError("Origen WebAuthn inválido", 400);
  }

  const isLocal = LOCALHOST_ORIGIN_RE.test(origin);
  const explicitRpId = process.env.WEBAUTHN_RP_ID?.trim();
  const matchesAllowedOrigin = allowedSet.has(origin);
  const matchesConfiguredRpId =
    Boolean(explicitRpId) &&
    parsed.protocol === "https:" &&
    (parsed.hostname === explicitRpId || parsed.hostname.endsWith(`.${explicitRpId}`));

  if (!isLocal && !matchesAllowedOrigin && !matchesConfiguredRpId) {
    throw new AuthServiceError(`Origen no permitido para WebAuthn: ${origin}`, 403);
  }

  const rpID = explicitRpId || parsed.hostname;
  return { origin, rpID };
}

function extractChallengeFromResponse(response) {
  const clientDataB64 = response?.response?.clientDataJSON;
  if (!clientDataB64) {
    throw new AuthServiceError("Respuesta biométrica incompleta (clientDataJSON faltante)", 400);
  }
  try {
    const rawJson = Buffer.from(clientDataB64, "base64url").toString("utf8");
    const clientData = JSON.parse(rawJson);
    if (!clientData?.challenge) {
      throw new Error("challenge missing");
    }
    return clientData.challenge;
  } catch {
    throw new AuthServiceError("La respuesta biométrica tiene un formato inválido", 400);
  }
}

function inferDeviceLabel(userAgent = "", customLabel = "") {
  const cleaned = String(customLabel || "").trim();
  if (cleaned) return cleaned.slice(0, 120);

  const ua = String(userAgent || "").toLowerCase();
  if (ua.includes("iphone")) return "iPhone (Face ID / Touch ID)";
  if (ua.includes("ipad")) return "iPad";
  if (ua.includes("android")) return "Teléfono Android (Huella)";
  if (ua.includes("mac os") || ua.includes("macintosh")) return "Dispositivo Apple";
  return "Dispositivo biométrico";
}

function normalizeDeviceInstanceId(value) {
  const cleaned = String(value || "").trim().slice(0, 120);
  return cleaned.length >= 8 ? cleaned : null;
}

function formatCredentialDTO(row, currentDeviceId = null) {
  const normalizedCurrent = normalizeDeviceInstanceId(currentDeviceId);
  return {
    id: row.id,
    credentialId: row.credential_id,
    deviceLabel: row.device_label,
    deviceType: row.device_type,
    backedUp: Boolean(row.backed_up),
    isCurrentDevice: Boolean(
      normalizedCurrent &&
        row.device_instance_id &&
        row.device_instance_id === normalizedCurrent
    ),
    transports: Array.isArray(row.transports) ? row.transports : [],
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
  };
}

async function assertDeviceInstanceAvailable(userId, deviceInstanceId) {
  const normalized = normalizeDeviceInstanceId(deviceInstanceId);
  if (!normalized) return null;

  const existing = await webauthnRepository.findByDeviceInstanceId(normalized);
  if (!existing) return normalized;

  if (Number(existing.user_id) === Number(userId)) {
    throw new AuthServiceError(
      "Este dispositivo ya tiene su huella o Face ID registrado en tu cuenta.",
      409,
      { code: "BIOMETRIC_DEVICE_ALREADY_REGISTERED" }
    );
  }

  throw new AuthServiceError(
    "La biometría de este dispositivo ya está vinculada a otra cuenta.",
    409,
    { code: "BIOMETRIC_DEVICE_IN_USE" }
  );
}

async function resolveActiveUser({ userId, email }) {
  let user = null;
  if (userId) {
    user = await authRepository.findById(Number(userId));
  } else if (email) {
    user = await authRepository.findByEmail(String(email).trim().toLowerCase());
  }

  if (!user) {
    throw new AuthServiceError("Usuario no encontrado", 404);
  }
  if (!user.is_active) {
    throw new AuthServiceError("Usuario inactivo", 403);
  }
  return user;
}

function toCredentialDescriptor(cred) {
  return {
    id: cred.credential_id,
    ...(Array.isArray(cred.transports) && cred.transports.length > 0
      ? { transports: cred.transports }
      : {}),
  };
}

async function createAuthChallengeForUser(user, purpose, context) {
  const credentials = await webauthnRepository.listByUserId(user.id);
  if (credentials.length === 0) {
    throw new AuthServiceError("Este usuario no tiene credenciales biométricas registradas", 404, {
      code: "NO_BIOMETRICS_REGISTERED",
    });
  }

  const options = await generateAuthenticationOptions({
    rpID: context.rpID,
    userVerification: "required",
    allowCredentials: credentials.map(toCredentialDescriptor),
  });

  await webauthnRepository.saveChallenge({
    challenge: options.challenge,
    userId: user.id,
    purpose,
    rpId: context.rpID,
    origin: context.origin,
    ttlSeconds: 300,
  });

  return options;
}

async function verifyAuthChallengeForUser(user, purpose, response, requestOrigin) {
  const context = resolveWebAuthnContext(requestOrigin);
  const challengeStr = extractChallengeFromResponse(response);

  const challengeRow = await webauthnRepository.consumeChallenge({
    challenge: challengeStr,
    purpose,
    userId: user.id,
  });

  if (!challengeRow) {
    throw new AuthServiceError("El reto biométrico expiró o ya fue utilizado. Inténtalo de nuevo.", 401, {
      code: "WEBAUTHN_CHALLENGE_INVALID",
    });
  }

  if (challengeRow.rp_id !== context.rpID && challengeRow.origin !== context.origin) {
    throw new AuthServiceError("El origen del reto biométrico no coincide", 403);
  }

  const credentialId = response?.id;
  if (!credentialId) {
    throw new AuthServiceError("Identificador de credencial faltante", 400);
  }

  const credRow = await webauthnRepository.findByCredentialIdAndUserId(credentialId, user.id);
  if (!credRow) {
    throw new AuthServiceError("Credencial biométrica no registrada para este usuario", 401);
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: challengeRow.origin,
      expectedRPID: challengeRow.rp_id,
      credential: {
        id: credRow.credential_id,
        publicKey: new Uint8Array(credRow.public_key),
        counter: Number(credRow.counter) || 0,
        transports: Array.isArray(credRow.transports) ? credRow.transports : undefined,
      },
      requireUserVerification: true,
    });
  } catch (err) {
    throw new AuthServiceError(
      err?.message || "No se pudo verificar la firma biométrica",
      401,
      { code: "WEBAUTHN_VERIFY_FAILED" }
    );
  }

  if (!verification?.verified) {
    throw new AuthServiceError("Verificación biométrica rechazada", 401);
  }

  await webauthnRepository.updateCredentialCounter(
    credRow.id,
    verification.authenticationInfo.newCounter
  );

  return credRow;
}

export const webauthnService = {
  async listMyCredentials(userId, currentDeviceId = null) {
    const rows = await webauthnRepository.listByUserId(userId);
    return rows.map((row) => formatCredentialDTO(row, currentDeviceId));
  },

  async deleteMyCredential(userId, credentialDbId) {
    const deleted = await webauthnRepository.deleteByIdAndUserId(Number(credentialDbId), userId);
    if (!deleted) {
      throw new AuthServiceError("Credencial biométrica no encontrada", 404);
    }
    return deleted;
  },

  async createRegistrationOptions(
    userId,
    requestOrigin,
    userAgent = "",
    deviceInstanceId = null
  ) {
    assertNonWindowsWebAuthnClient(userAgent);
    const user = await resolveActiveUser({ userId });
    const context = resolveWebAuthnContext(requestOrigin);
    await assertDeviceInstanceAvailable(user.id, deviceInstanceId);
    const existing = await webauthnRepository.listByUserId(user.id);

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: context.rpID,
      userID: new TextEncoder().encode(String(user.id)),
      userName: user.user_email || `staff-${user.id}@dpiero.local`,
      userDisplayName: user.user_name || "Usuario D'Piero",
      attestationType: "none",
      excludeCredentials: existing.map(toCredentialDescriptor),
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "discouraged",
        userVerification: "required",
      },
    });

    await webauthnRepository.saveChallenge({
      challenge: options.challenge,
      userId: user.id,
      purpose: "register",
      rpId: context.rpID,
      origin: context.origin,
      ttlSeconds: 300,
    });

    return options;
  },

  async verifyAndSaveRegistration(
    userId,
    { response, deviceLabel, deviceInstanceId, userAgent },
    requestOrigin
  ) {
    assertNonWindowsWebAuthnClient(userAgent);
    const user = await resolveActiveUser({ userId });
    const context = resolveWebAuthnContext(requestOrigin);
    const normalizedDeviceId = await assertDeviceInstanceAvailable(
      user.id,
      deviceInstanceId
    );
    const challengeStr = extractChallengeFromResponse(response);

    const challengeRow = await webauthnRepository.consumeChallenge({
      challenge: challengeStr,
      purpose: "register",
      userId: user.id,
    });

    if (!challengeRow) {
      throw new AuthServiceError("El reto de registro biométrico expiró. Intenta nuevamente.", 400);
    }

    if (challengeRow.rp_id !== context.rpID && challengeRow.origin !== context.origin) {
      throw new AuthServiceError("El origen de registro no coincide con el reto", 403);
    }

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: challengeRow.challenge,
        expectedOrigin: challengeRow.origin,
        expectedRPID: challengeRow.rp_id,
        requireUserVerification: true,
      });
    } catch (err) {
      throw new AuthServiceError(
        err?.message || "No se pudo validar el dispositivo biométrico",
        400
      );
    }

    if (!verification?.verified || !verification?.registrationInfo) {
      throw new AuthServiceError("Registro biométrico no verificado", 400);
    }

    const { registrationInfo } = verification;
    const { credential, credentialDeviceType, credentialBackedUp, aaguid } = registrationInfo;

    if (WINDOWS_HELLO_AAGUIDS.has(normalizeAaguid(aaguid))) {
      throw new AuthServiceError(
        "Windows Hello está bloqueado por seguridad (acepta PIN de Windows y guarda llaves locales). Usa contraseña o un lector físico dedicado.",
        403,
        { code: "WINDOWS_HELLO_FORBIDDEN" }
      );
    }

    if (credentialBackedUp || credentialDeviceType === "multiDevice") {
      throw new AuthServiceError(
        "No se permiten llaves de acceso (passkeys) sincronizadas o guardadas en la nube/navegador.",
        400,
        { code: "SYNCED_PASSKEY_FORBIDDEN" }
      );
    }

    const existingByCredId = await webauthnRepository.findByCredentialId(credential.id);
    const existingByPubKey = existingByCredId
      ? existingByCredId
      : await webauthnRepository.findByPublicKey(credential.publicKey);
    const conflict = existingByCredId || existingByPubKey;

    if (conflict) {
      if (Number(conflict.user_id) === Number(user.id)) {
        throw new AuthServiceError(
          "Esta huella o Face ID ya está registrado en tu cuenta.",
          409,
          { code: "BIOMETRIC_ALREADY_REGISTERED" }
        );
      }
      throw new AuthServiceError(
        "Esta huella o Face ID ya está vinculado a otra cuenta.",
        409,
        { code: "BIOMETRIC_IN_USE" }
      );
    }

    let saved;
    try {
      saved = await webauthnRepository.createCredential({
        userId: user.id,
        credentialId: credential.id,
        publicKey: credential.publicKey,
        counter: credential.counter,
        transports: response?.response?.transports || credential.transports || [],
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        deviceLabel: inferDeviceLabel(userAgent, deviceLabel),
        deviceInstanceId: normalizedDeviceId,
      });
    } catch (err) {
      if (err?.code === "23505") {
        throw new AuthServiceError(
          "Esta huella o Face ID ya está registrado.",
          409,
          { code: "BIOMETRIC_ALREADY_REGISTERED" }
        );
      }
      throw err;
    }

    return formatCredentialDTO(saved, normalizedDeviceId);
  },

  async checkEmailForLogin(email, clientKey = "unknown") {
    enforceEmailCheckRateLimit(clientKey);
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new AuthServiceError("Ingresa un correo electrónico válido", 400);
    }

    const user = await authRepository.findByEmail(cleanEmail);
    if (!user) {
      return {
        valid: false,
        reason: "not_found",
        message: "No existe ninguna cuenta registrada con ese correo.",
      };
    }

    if (!user.is_active) {
      return {
        valid: false,
        reason: "inactive",
        message: "Esta cuenta está inactiva. Contacta al administrador.",
      };
    }

    const credentialCount = await webauthnRepository.countByUserId(user.id);
    const { isAdmin, role } = resolveUserFlagsAndRole(user);

    return {
      valid: true,
      email: user.user_email,
      name: user.user_name,
      role,
      isAdmin,
      hasBiometrics: credentialCount > 0,
      credentialCount,
    };
  },

  async getUserBiometricAndLockStatus(userId) {
    const user = await authRepository.findById(Number(userId));
    if (!user || !user.is_active) {
      return {
        hasBiometrics: false,
        credentialCount: 0,
        isLocked: false,
        retryAfterSeconds: 0,
      };
    }

    const credentialCount = await webauthnRepository.countByUserId(user.id);
    const retryAfterSeconds = Number(user.pin_lock_remaining_seconds || 0);

    return {
      hasBiometrics: credentialCount > 0,
      credentialCount,
      isLocked: retryAfterSeconds > 0,
      retryAfterSeconds,
    };
  },

  async createLoginOptions({ userId, email, userAgent = "" }, requestOrigin) {
    assertNonWindowsWebAuthnClient(userAgent);
    const user = await resolveActiveUser({ userId, email });
    const context = resolveWebAuthnContext(requestOrigin);
    return createAuthChallengeForUser(user, "login", context);
  },

  async verifyLoginAssertion({ userId, email, response, userAgent = "" }, requestOrigin) {
    assertNonWindowsWebAuthnClient(userAgent);
    const user = await resolveActiveUser({ userId, email });
    await verifyAuthChallengeForUser(user, "login", response, requestOrigin);

    if (Number(user.pin_failed_attempts) > 0 || user.pin_locked_until) {
      await authRepository.resetPinAttempts(user.id);
    }

    return issueSessionForUser(user);
  },

  async createStepUpOptions(userId, requestOrigin, userAgent = "") {
    if (isWindowsDesktopUserAgent(userAgent)) {
      return { hasBiometrics: false, options: null, reason: "DESKTOP_BIOMETRICS_DISABLED" };
    }
    const user = await resolveActiveUser({ userId });
    const count = await webauthnRepository.countByUserId(user.id);
    if (count === 0) {
      return { hasBiometrics: false, options: null };
    }
    const context = resolveWebAuthnContext(requestOrigin);
    const options = await createAuthChallengeForUser(user, "step_up", context);
    return { hasBiometrics: true, options };
  },

  async verifyStepUp(userId, { response, password, userAgent = "" }, requestOrigin) {
    const user = await resolveActiveUser({ userId });
    let verifiedMethod = null;

    if (response) {
      assertNonWindowsWebAuthnClient(userAgent);
      await verifyAuthChallengeForUser(user, "step_up", response, requestOrigin);
      verifiedMethod = "biometric";
    } else if (password !== undefined && password !== null && String(password).trim() !== "") {
      const matched = await verifyUserPasswordSecret(user, password);
      if (!matched) {
        throw new AuthServiceError("Contraseña incorrecta. Verifica e intenta nuevamente.", 401, {
          code: "INVALID_STEP_UP_PASSWORD",
        });
      }
      verifiedMethod = "password";
    } else {
      throw new AuthServiceError(
        "Se requiere confirmación por huella o contraseña de administrador",
        400
      );
    }

    const stepUpToken = jwt.sign(
      {
        userId: user.id,
        purpose: "admin_step_up",
        method: verifiedMethod,
      },
      getJWTSecret(),
      { expiresIn: "90s" }
    );

    return {
      stepUpToken,
      expiresInSeconds: 90,
      method: verifiedMethod,
    };
  },
};

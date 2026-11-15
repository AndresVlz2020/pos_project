// frontend/src/services/biometricService.js
// Cliente WebAuthn (@simplewebauthn/browser) y comunicación con los endpoints biométricos

import {
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export function getAuthToken() {
  return (
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

export function getStoredAuthUser() {
  try {
    const raw =
      localStorage.getItem("auth_user") || sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isCurrentUserAdmin(user = getStoredAuthUser()) {
  if (!user) return false;
  return Boolean(
    user.isAdmin ||
      user.isSuperuser ||
      String(user.role || "").toLowerCase() === "admin" ||
      String(user.role || "").toLowerCase() === "administrador"
  );
}

function buildAuthHeaders(extra = {}) {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function apiJson(path, { method = "GET", body, auth = false } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    cache: "no-store",
    headers: auth ? buildAuthHeaders() : { "Content-Type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(
      data.error || data.message || `Error en el servidor (${response.status})`
    );
    err.status = response.status;
    err.code = data.code;
    err.retryAfterSeconds = data.retryAfterSeconds;
    err.attemptsRemaining = data.attemptsRemaining;
    throw err;
  }
  return data;
}

/**
 * Traduce errores nativos del navegador/WebAuthn a mensajes comprensibles.
 */
export function mapWebAuthnError(err, fallback = "No se pudo completar la verificación biométrica.") {
  const name = err?.name || "";
  const msg = String(err?.message || "").toLowerCase();

  if (
    name === "NotAllowedError" ||
    name === "AbortError" ||
    msg.includes("timed out") ||
    msg.includes("not allowed") ||
    msg.includes("aborted") ||
    msg.includes("canceled") ||
    msg.includes("cancelled")
  ) {
    const wrapped = new Error("Verificación biométrica cancelada o expirada.");
    wrapped.isUserCancelled = true;
    return wrapped;
  }

  if (name === "InvalidStateError") {
    return new Error("Este dispositivo ya tiene registrada esta credencial en tu cuenta.");
  }

  if (name === "SecurityError" || name === "NotSupportedError") {
    return new Error(
      "Tu navegador o conexión actual no admite WebAuthn biométrico (requiere HTTPS o localhost)."
    );
  }

  return err instanceof Error ? err : new Error(fallback);
}

/**
 * Detecta la plataforma cliente actual para impedir por completo Windows Hello
 * y prompts biométricos nativos en equipos de escritorio (PC/Windows/macOS/Linux).
 */
export function detectClientPlatform() {
  if (typeof navigator === "undefined") {
    return { isDesktop: true, isWindows: false, isMobile: false };
  }

  const ua = String(navigator.userAgent || "").toLowerCase();
  const uaData = navigator.userAgentData;
  const uaPlatform = String(uaData?.platform || "").toLowerCase();
  const maxTouch = Number(navigator.maxTouchPoints || 0);

  const isWindows =
    !ua.includes("windows phone") &&
    (/windows nt|win64|wow64/.test(ua) || uaPlatform === "windows");

  if (isWindows) {
    return { isDesktop: true, isWindows: true, isMobile: false };
  }

  const isAndroid = /android/.test(ua) || uaPlatform === "android";
  const isAppleTouch =
    /iphone|ipad|ipod/.test(ua) ||
    uaPlatform === "ios" ||
    ((/macintosh/.test(ua) || uaPlatform === "macos") && maxTouch > 1);

  const isMobile = Boolean(isAndroid || isAppleTouch || uaData?.mobile === true);
  return {
    isDesktop: !isMobile,
    isWindows: false,
    isMobile,
  };
}

function getConfiguredPhysicalScannerUrl() {
  const fromEnv = String(import.meta.env.VITE_PHYSICAL_SCANNER_URL || "").trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  try {
    const fromStorage = String(localStorage.getItem("pos_physical_scanner_url") || "").trim();
    return fromStorage ? fromStorage.replace(/\/+$/, "") : "";
  } catch {
    return "";
  }
}

async function probePhysicalScannerBridge() {
  const baseUrl = getConfiguredPhysicalScannerUrl();
  if (!baseUrl) {
    return { configured: false, connected: false };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1200);

  try {
    const res = await fetch(`${baseUrl}/health`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return { configured: true, connected: false };
    const data = await res.json().catch(() => ({}));
    const connected = Boolean(
      data?.readerConnected ?? data?.hardwareDetected ?? data?.connected
    );
    return { configured: true, connected };
  } catch {
    return { configured: true, connected: false };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Identifica si el equipo cuenta con biometría permitida y segura.
 * - En PC/Windows bloquea Windows Hello / passkeys de escritorio para evitar
 *   prompts molestos o fallback con PIN de Windows.
 * - Solo habilita WebAuthn en dispositivos móviles/tablets con sensor local,
 *   mientras se integre un SDK de lector físico USB en caja.
 */
export async function getBiometricCapabilities() {
  const secureContext = typeof window !== "undefined" ? Boolean(window.isSecureContext) : false;
  const platform = detectClientPlatform();

  if (platform.isDesktop) {
    const physical = await probePhysicalScannerBridge();
    return {
      supported: false,
      platformAvailable: false,
      secureContext,
      isDesktop: true,
      isWindows: platform.isWindows,
      mode: "none",
      physicalScannerConfigured: physical.configured,
      physicalScannerConnected: physical.connected,
      reason: physical.configured
        ? "pc_physical_bridge_pending_sdk"
        : "pc_no_physical_scanner",
    };
  }

  if (!secureContext) {
    return {
      supported: false,
      platformAvailable: false,
      secureContext: false,
      isDesktop: false,
      isWindows: false,
      mode: "none",
      physicalScannerConfigured: false,
      physicalScannerConnected: false,
      reason: "insecure_context",
    };
  }

  try {
    const supported = browserSupportsWebAuthn();
    if (!supported) {
      return {
        supported: false,
        platformAvailable: false,
        secureContext: true,
        isDesktop: false,
        isWindows: false,
        mode: "none",
        physicalScannerConfigured: false,
        physicalScannerConnected: false,
        reason: "webauthn_unsupported",
      };
    }
    const platformAvailable = await platformAuthenticatorIsAvailable();
    return {
      supported: true,
      platformAvailable: Boolean(platformAvailable),
      secureContext: true,
      isDesktop: false,
      isWindows: false,
      mode: platformAvailable ? "mobile-webauthn" : "none",
      physicalScannerConfigured: false,
      physicalScannerConnected: false,
      reason: platformAvailable ? "mobile_sensor_ready" : "mobile_no_biometrics",
    };
  } catch {
    return {
      supported: false,
      platformAvailable: false,
      secureContext,
      isDesktop: false,
      isWindows: false,
      mode: "none",
      physicalScannerConfigured: false,
      physicalScannerConnected: false,
      reason: "probe_error",
    };
  }
}

export async function listMyBiometricsApi() {
  const data = await apiJson("/auth/webauthn/credentials", { auth: true });
  return Array.isArray(data?.credentials) ? data.credentials : [];
}

export async function deleteMyBiometricApi(id) {
  return apiJson(`/auth/webauthn/credentials/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

function assertNonDesktopBiometricAllowed() {
  if (detectClientPlatform().isDesktop) {
    throw new Error(
      "Windows Hello y passkeys de escritorio están deshabilitados por seguridad en PC."
    );
  }
}

export async function enrollMyBiometricApi(deviceLabel = "") {
  assertNonDesktopBiometricAllowed();
  const { options } = await apiJson("/auth/webauthn/register/options", {
    method: "POST",
    auth: true,
  });

  let attestationResponse;
  try {
    attestationResponse = await startRegistration({ optionsJSON: options });
  } catch (err) {
    throw mapWebAuthnError(err, "No se pudo capturar la huella en este dispositivo.");
  }

  return apiJson("/auth/webauthn/register/verify", {
    method: "POST",
    auth: true,
    body: {
      response: attestationResponse,
      deviceLabel,
    },
  });
}

export async function checkAdminEmailApi(email) {
  return apiJson("/auth/webauthn/login/email-check", {
    method: "POST",
    body: { email },
  });
}

export async function getUserBiometricStatusApi(userId) {
  return apiJson(`/auth/webauthn/users/${userId}/status`);
}

export async function loginWithBiometricsApi({ userId, email }) {
  assertNonDesktopBiometricAllowed();
  const { options } = await apiJson("/auth/webauthn/login/options", {
    method: "POST",
    body: { userId, email },
  });

  let assertionResponse;
  try {
    assertionResponse = await startAuthentication({ optionsJSON: options });
  } catch (err) {
    throw mapWebAuthnError(err, "No se pudo validar tu huella para iniciar sesión.");
  }

  return apiJson("/auth/webauthn/login/verify", {
    method: "POST",
    body: {
      userId,
      email,
      response: assertionResponse,
    },
  });
}

export async function getAdminStepUpOptionsApi() {
  return apiJson("/auth/step-up/options", {
    method: "POST",
    auth: true,
  });
}

export async function verifyAdminStepUpWithBiometricsApi(options) {
  assertNonDesktopBiometricAllowed();
  let assertionResponse;
  try {
    assertionResponse = await startAuthentication({ optionsJSON: options });
  } catch (err) {
    throw mapWebAuthnError(err, "No se pudo confirmar tu huella de administrador.");
  }

  return apiJson("/auth/step-up/verify", {
    method: "POST",
    auth: true,
    body: { response: assertionResponse },
  });
}

export async function verifyAdminStepUpWithPasswordApi(password) {
  return apiJson("/auth/step-up/verify", {
    method: "POST",
    auth: true,
    body: { password },
  });
}

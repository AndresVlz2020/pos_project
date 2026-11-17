// frontend/src/services/biometricService.js
// Cliente WebAuthn (@simplewebauthn/browser) y comunicación con los endpoints biométricos

import {
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import {
  getAuthToken as readSessionAuthToken,
  getStoredAuthUser as readSessionAuthUser,
} from "@/shared/utils/authStorage";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:4000/api";

const BIOMETRIC_DEVICE_ID_KEY = "dpiero_biometric_device_id";

export function getBiometricDeviceId() {
  if (typeof window === "undefined") return "";
  try {
    let existing = window.sessionStorage.getItem(BIOMETRIC_DEVICE_ID_KEY);
    if (existing && existing.trim().length >= 8) {
      return existing.trim();
    }
    const generated =
      typeof window.crypto?.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    window.sessionStorage.setItem(BIOMETRIC_DEVICE_ID_KEY, generated);
    return generated;
  } catch {
    return "";
  }
}

export function getAuthToken() {
  return readSessionAuthToken();
}

export function getStoredAuthUser() {
  return readSessionAuthUser();
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
    return new Error("Esta huella o Face ID ya está registrado en tu cuenta desde este dispositivo.");
  }

  if (name === "SecurityError" || name === "NotSupportedError") {
    return new Error(
      "Tu navegador o conexión actual no admite WebAuthn biométrico (requiere HTTPS o localhost)."
    );
  }

  return err instanceof Error ? err : new Error(fallback);
}

const windowsGpuCache = new WeakMap();

/**
 * Detecta si el navegador corre físicamente sobre Windows leyendo el renderer WebGL
 * (Direct3D / D3D11 / D3D9 / Microsoft Basic Render), que no se falsea al usar
 * la emulación móvil de DevTools en Chrome/Edge.
 */
function hasWindowsDirect3DRenderer(doc = typeof document !== "undefined" ? document : null) {
  if (!doc || typeof doc.createElement !== "function") return false;
  if (windowsGpuCache.has(doc)) return windowsGpuCache.get(doc);

  let detected = false;
  try {
    const canvas = doc.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = dbg
        ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "")
        : String(gl.getParameter(gl.RENDERER) || "");
      detected = /direct3d|d3d11|d3d9|microsoft basic render/i.test(renderer);
      gl.getExtension("WEBGL_lose_context")?.loseContext?.();
    }
  } catch {
    detected = false;
  }

  windowsGpuCache.set(doc, detected);
  return detected;
}

/**
 * Detecta la plataforma cliente actual para impedir por completo Windows Hello
 * y prompts biométricos nativos en equipos de escritorio (PC/Windows/macOS/Linux).
 */
export function detectClientPlatform(
  nav = typeof navigator !== "undefined" ? navigator : null,
  doc = typeof document !== "undefined" ? document : null
) {
  if (!nav) {
    return { isDesktop: true, isWindows: false, isMobile: false };
  }

  const ua = String(nav.userAgent || "").toLowerCase();
  const platformProp = String(nav.platform || "").toLowerCase();
  const uaData = nav.userAgentData;
  const uaPlatform = String(uaData?.platform || "").toLowerCase();
  const maxTouch = Number(nav.maxTouchPoints || 0);

  const isWindowsUa =
    !ua.includes("windows phone") &&
    /windows nt|win64|wow64|windows 10|windows 11/.test(ua);
  const isWindowsNavPlatform =
    /^win/i.test(platformProp) && !platformProp.includes("phone");
  const isWindowsUaData = uaPlatform === "windows";
  const isWindowsGpu = hasWindowsDirect3DRenderer(doc);

  if (isWindowsUa || isWindowsNavPlatform || isWindowsUaData || isWindowsGpu) {
    return { isDesktop: true, isWindows: true, isMobile: false };
  }

  const hasAndroidToken = /android/.test(ua) || uaPlatform === "android";
  const hasAppleTouchToken =
    /iphone|ipad|ipod/.test(ua) ||
    uaPlatform === "ios" ||
    ((/macintosh/.test(ua) || uaPlatform === "macos" || /^mac/i.test(platformProp)) &&
      maxTouch > 1);

  const isDesktopMac =
    !hasAppleTouchToken &&
    (/macintosh/.test(ua) || uaPlatform === "macos" || /^mac/i.test(platformProp));
  const isDesktopLinux =
    !hasAndroidToken &&
    (/linux (x86_64|i686|amd64)|x11;\s*linux|\bcros\b/.test(ua) ||
      /^linux\s*(x86_64|i686|i386|amd64)/.test(platformProp) ||
      uaPlatform === "linux" ||
      uaPlatform === "chrome os" ||
      uaPlatform === "chromium os");

  if (isDesktopMac || isDesktopLinux) {
    return { isDesktop: true, isWindows: false, isMobile: false };
  }

  const isMobile = Boolean(hasAndroidToken || hasAppleTouchToken || uaData?.mobile === true);
  return {
    isDesktop: !isMobile,
    isWindows: false,
    isMobile,
  };
}

function getConfiguredPhysicalScannerUrl() {
  const fromEnv = String(import.meta.env?.VITE_PHYSICAL_SCANNER_URL || "").trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  try {
    const fromStorage = String(sessionStorage.getItem("pos_physical_scanner_url") || "").trim();
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

async function hasHighEntropyDesktopPlatform() {
  if (typeof navigator === "undefined") return false;
  const uaData = navigator.userAgentData;
  if (!uaData || typeof uaData.getHighEntropyValues !== "function") return false;
  try {
    const hints = await uaData.getHighEntropyValues(["platform"]);
    const p = String(hints?.platform || "").toLowerCase();
    return p === "windows" || p === "linux" || p === "chrome os" || p === "chromium os";
  } catch {
    return false;
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
  let platform = detectClientPlatform();

  if (!platform.isDesktop && (await hasHighEntropyDesktopPlatform())) {
    platform = { isDesktop: true, isWindows: true, isMobile: false };
  }

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
  const deviceId = getBiometricDeviceId();
  const query = deviceId ? `?deviceId=${encodeURIComponent(deviceId)}` : "";
  const data = await apiJson(`/auth/webauthn/credentials${query}`, { auth: true });
  return Array.isArray(data?.credentials) ? data.credentials : [];
}

export async function deleteMyBiometricApi(id) {
  return apiJson(`/auth/webauthn/credentials/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

async function assertNonDesktopBiometricAllowed() {
  if (detectClientPlatform().isDesktop || (await hasHighEntropyDesktopPlatform())) {
    throw new Error(
      "Windows Hello y passkeys de escritorio están deshabilitados por seguridad en PC."
    );
  }
}

export async function enrollMyBiometricApi(deviceLabel = "") {
  await assertNonDesktopBiometricAllowed();
  const deviceId = getBiometricDeviceId();
  const { options } = await apiJson("/auth/webauthn/register/options", {
    method: "POST",
    auth: true,
    body: { deviceId },
  });

  let attestationResponse;
  try {
    attestationResponse = await startRegistration({ optionsJSON: options });
  } catch (err) {
    throw mapWebAuthnError(err, "No se pudo capturar la huella o Face ID en este dispositivo.");
  }

  return apiJson("/auth/webauthn/register/verify", {
    method: "POST",
    auth: true,
    body: {
      response: attestationResponse,
      deviceLabel,
      deviceId,
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
  await assertNonDesktopBiometricAllowed();
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
  await assertNonDesktopBiometricAllowed();
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

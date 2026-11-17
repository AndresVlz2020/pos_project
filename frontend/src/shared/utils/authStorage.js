// Utilidades centralizadas de sesión exclusivamente sobre sessionStorage
const SESSION_LAST_ROUTE_KEY = "dpiero_last_protected_route";

export function getAuthToken() {
  try {
    return (
      sessionStorage.getItem("auth_token") ||
      sessionStorage.getItem("token") ||
      ""
    );
  } catch {
    return "";
  }
}

export function getStoredAuthUser() {
  try {
    const raw =
      sessionStorage.getItem("auth_user") || sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAuthHeaders(extra = {}) {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export function getMultipartAuthHeaders(extra = {}) {
  const token = getAuthToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export function setAuthSession(token, userObj) {
  try {
    sessionStorage.setItem("auth_token", token);
    sessionStorage.setItem("auth_user", JSON.stringify(userObj));
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(userObj));

    // Garantizar que no queden credenciales heredadas en localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  } catch {
    // Ignorar errores de almacenamiento
  }
}

export function updateStoredAuthUser(partial) {
  const current = getStoredAuthUser();
  if (!current) return null;
  const updated = { ...current, ...partial };
  try {
    const serialized = JSON.stringify(updated);
    sessionStorage.setItem("auth_user", serialized);
    sessionStorage.setItem("user", serialized);
  } catch {
    // Ignorar errores de almacenamiento
  }
  return updated;
}

export function clearAuthSession() {
  try {
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem(SESSION_LAST_ROUTE_KEY);

    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  } catch {
    // Ignorar errores de almacenamiento
  }
}

export function getLastProtectedRoute() {
  try {
    const route = sessionStorage.getItem(SESSION_LAST_ROUTE_KEY) || "/";
    const lower = route.toLowerCase();
    if (lower.startsWith("/auth") || lower === "/login") {
      return "/";
    }
    return route;
  } catch {
    return "/";
  }
}

export function setLastProtectedRoute(path) {
  if (!path || typeof path !== "string") return;
  const lower = path.toLowerCase();
  if (lower.startsWith("/auth") || lower === "/login") return;
  try {
    sessionStorage.setItem(SESSION_LAST_ROUTE_KEY, path);
  } catch {
    // Ignorar errores de almacenamiento
  }
}

export function getUserRoleFlags(user = getStoredAuthUser()) {
  const rawRole = String(user?.role || user?.userType || "").trim();
  const lower = rawRole.toLowerCase();
  const isAdmin = Boolean(
    user?.isAdmin ||
      user?.isSuperuser ||
      lower === "admin" ||
      lower === "administrador"
  );
  const isCajero = !isAdmin && (lower === "cajero" || lower.includes("caj"));
  const isMesero =
    !isAdmin &&
    !isCajero &&
    (lower === "mesero" || lower.includes("meser") || lower.includes("salon"));
  const isCocina =
    !isAdmin &&
    !isCajero &&
    !isMesero &&
    (lower === "cocina" ||
      lower.includes("cocin") ||
      lower.includes("parrill") ||
      lower.includes("brasa"));

  return {
    role: rawRole,
    isAdmin,
    isCajero,
    isMesero,
    isCocina,
  };
}

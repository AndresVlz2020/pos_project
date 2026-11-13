import { API_URL } from "@/features/config";

const SESSIONS_URL = `${API_URL}/sessions`;

function getToken() {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("token") || "";
}

function getAuthHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function formatDuration(totalSeconds = 0) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return [hrs, mins, secs].map((n) => String(n).padStart(2, "0")).join(":");
}

export async function getCurrentSession() {
  const token = getToken();
  if (!token) return { isAdmin: false, session: null };
  const res = await fetch(`${SESSIONS_URL}/current`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) return { isAdmin: false, session: null };
  return res.json();
}

export async function sendSessionHeartbeat() {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${SESSIONS_URL}/heartbeat`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function endCurrentSession() {
  const token = getToken();
  if (!token) return;
  try {
    await fetch(`${SESSIONS_URL}/end`, {
      method: "POST",
      headers: getAuthHeaders(),
      keepalive: true,
    });
  } catch {
    // Silenciar errores de red durante cierre de sesión
  }
}

export async function getActiveStaffSessions() {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${SESSIONS_URL}/active`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getSessionHistory(userId = null) {
  const token = getToken();
  if (!token) return [];
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const res = await fetch(`${SESSIONS_URL}/history${query}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

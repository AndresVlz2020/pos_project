/**
 * Utilidades puras para filtrar y sumar horas del historial de turnos/sesiones.
 */

export function toLocalDateKey(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getSessionElapsedSeconds(
  session,
  nowMs = Date.now(),
  loadedAtMs = null
) {
  if (!session) return 0;
  if (session.isActive) {
    if (loadedAtMs != null && Number.isFinite(Number(session.durationSeconds))) {
      const serverBase = Math.max(0, Math.floor(Number(session.durationSeconds)));
      const localDelta = Math.max(0, Math.floor((nowMs - loadedAtMs) / 1000));
      return serverBase + localDelta;
    }
    if (session.startedAt) {
      const startMs = new Date(session.startedAt).getTime();
      if (!Number.isNaN(startMs)) {
        return Math.max(0, Math.floor((nowMs - startMs) / 1000));
      }
    }
  }
  return Math.max(0, Math.floor(Number(session.durationSeconds) || 0));
}

export function formatTotalHours(totalSeconds = 0) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  return `${hrs} h ${String(mins).padStart(2, "0")} min`;
}

export function formatDayHeading(dateKey, nowMs = Date.now()) {
  if (!dateKey) return "Sin fecha";
  const todayKey = toLocalDateKey(nowMs);
  const yesterdayMs = new Date(nowMs);
  yesterdayMs.setDate(yesterdayMs.getDate() - 1);
  const yesterdayKey = toLocalDateKey(yesterdayMs);

  const [y, m, d] = dateKey.split("-").map(Number);
  const localDate = new Date(y, (m || 1) - 1, d || 1);
  const formatted = localDate.toLocaleDateString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (dateKey === todayKey) return `Hoy · ${formatted}`;
  if (dateKey === yesterdayKey) return `Ayer · ${formatted}`;
  return formatted;
}

function isAdminAccount(user) {
  if (!user) return false;
  if (user.isSuperUser || user.isSuperuser || user.isAdmin) return true;
  const roleText = `${user.userType || ""} ${user.role || ""}`.toLowerCase();
  return roleText.includes("admin");
}

export function extractWorkerOptions(rows = [], directoryUsers = []) {
  const map = new Map();

  for (const user of Array.isArray(directoryUsers) ? directoryUsers : []) {
    if (!user?.id || isAdminAccount(user)) continue;
    const id = String(user.id);
    map.set(id, {
      id,
      userName: user.userName || user.name || "Colaborador",
      userType: user.userType || user.role || "Personal",
    });
  }

  for (const row of Array.isArray(rows) ? rows : []) {
    const rawId = row?.userId;
    if (!rawId) continue;
    const id = String(rawId);
    if (!map.has(id)) {
      map.set(id, {
        id,
        userName: row.userName || "Colaborador",
        userType: row.userType || "Personal",
      });
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.userName.localeCompare(b.userName, "es", { sensitivity: "base" })
  );
}

export function filterSessionRows(
  rows = [],
  { workerId = "", datePreset = "all", specificDate = "", nowMs = Date.now() } = {}
) {
  const list = Array.isArray(rows) ? rows : [];
  const todayKey = toLocalDateKey(nowMs);
  const normalizedSpecific = specificDate ? specificDate.trim() : "";
  const normalizedWorker = workerId ? String(workerId).trim() : "";

  const weekStartDate = new Date(nowMs);
  weekStartDate.setHours(0, 0, 0, 0);
  weekStartDate.setDate(weekStartDate.getDate() - 6);
  const weekStartKey = toLocalDateKey(weekStartDate);
  const monthPrefix = todayKey.slice(0, 7);

  return list.filter((row) => {
    if (normalizedWorker && String(row?.userId || "") !== normalizedWorker) {
      return false;
    }

    const rowDayKey = toLocalDateKey(row?.startedAt);

    if (normalizedSpecific) {
      return rowDayKey === normalizedSpecific;
    }
    if (datePreset === "today") {
      return rowDayKey === todayKey;
    }
    if (datePreset === "7d") {
      return Boolean(rowDayKey && rowDayKey >= weekStartKey && rowDayKey <= todayKey);
    }
    if (datePreset === "month") {
      return Boolean(rowDayKey && rowDayKey.startsWith(monthPrefix));
    }

    return true;
  });
}

export function summarizeSessionsByDay(
  rows = [],
  nowMs = Date.now(),
  loadedAtMs = null
) {
  const list = Array.isArray(rows) ? rows : [];
  const dayMap = new Map();

  for (const row of list) {
    const dateKey = toLocalDateKey(row?.startedAt);
    if (!dateKey) continue;

    const elapsed = getSessionElapsedSeconds(row, nowMs, loadedAtMs);
    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, {
        dateKey,
        label: formatDayHeading(dateKey, nowMs),
        totalSeconds: 0,
        sessionCount: 0,
        activeCount: 0,
        userMap: new Map(),
      });
    }

    const bucket = dayMap.get(dateKey);
    bucket.totalSeconds += elapsed;
    bucket.sessionCount += 1;
    if (row?.isActive) bucket.activeCount += 1;

    const uKey = String(row?.userId || row?.userName || "unknown");
    if (!bucket.userMap.has(uKey)) {
      bucket.userMap.set(uKey, {
        userKey: uKey,
        userName: row?.userName || "Colaborador",
        userType: row?.userType || "Personal",
        totalSeconds: 0,
        count: 0,
      });
    }
    const uEntry = bucket.userMap.get(uKey);
    uEntry.totalSeconds += elapsed;
    uEntry.count += 1;
  }

  return Array.from(dayMap.values())
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
    .map(({ userMap, ...rest }) => ({
      ...rest,
      users: Array.from(userMap.values()).sort((a, b) => b.totalSeconds - a.totalSeconds),
    }));
}

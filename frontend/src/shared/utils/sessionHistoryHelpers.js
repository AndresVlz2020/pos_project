/**
 * Utilidades puras para filtrar y sumar horas del historial de turnos/sesiones.
 */

export function normalizeSearchText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

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

export function getSessionElapsedSeconds(session, nowMs = Date.now()) {
  if (!session) return 0;
  if (session.isActive && session.startedAt) {
    const startMs = new Date(session.startedAt).getTime();
    if (!Number.isNaN(startMs)) {
      return Math.max(0, Math.floor((nowMs - startMs) / 1000));
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

function buildDateSearchTokens(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(yyyy).slice(-2);
  const dNum = String(date.getDate());
  const mNum = String(date.getMonth() + 1);
  const hh24 = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  const shortStr = date.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
  const longMonth = date.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return [
    `${yyyy}-${mm}-${dd}`,
    `${dd}/${mm}/${yyyy}`,
    `${dd}/${mm}/${yy}`,
    `${dNum}/${mNum}/${yyyy}`,
    `${dd}/${mm}`,
    `${dd}-${mm}-${yyyy}`,
    `${dd}-${mm}`,
    `${hh24}:${min}`,
    shortStr,
    longMonth,
  ].join(" ");
}

export function filterSessionRows(
  rows = [],
  { search = "", datePreset = "all", specificDate = "", nowMs = Date.now() } = {}
) {
  const list = Array.isArray(rows) ? rows : [];
  const todayKey = toLocalDateKey(nowMs);
  const normalizedSpecific = specificDate ? specificDate.trim() : "";

  const weekStartDate = new Date(nowMs);
  weekStartDate.setHours(0, 0, 0, 0);
  weekStartDate.setDate(weekStartDate.getDate() - 6);
  const weekStartKey = toLocalDateKey(weekStartDate);
  const monthPrefix = todayKey.slice(0, 7);

  const normalizedQuery = normalizeSearchText(search);
  const queryTerms = normalizedQuery ? normalizedQuery.split(" ") : [];

  return list.filter((row) => {
    const rowDayKey = toLocalDateKey(row?.startedAt);

    if (normalizedSpecific) {
      if (rowDayKey !== normalizedSpecific) return false;
    } else if (datePreset === "today") {
      if (rowDayKey !== todayKey) return false;
    } else if (datePreset === "7d") {
      if (!rowDayKey || rowDayKey < weekStartKey || rowDayKey > todayKey) {
        return false;
      }
    } else if (datePreset === "month") {
      if (!rowDayKey || !rowDayKey.startsWith(monthPrefix)) return false;
    }

    if (queryTerms.length === 0) return true;

    const statusLabel = row?.isActive
      ? "en turno activa en curso"
      : "finalizada terminada";
    const dayLabel = formatDayHeading(rowDayKey, nowMs);
    const searchable = normalizeSearchText(
      [
        row?.userName,
        row?.userType,
        statusLabel,
        rowDayKey,
        dayLabel,
        buildDateSearchTokens(row?.startedAt),
        row?.endedAt ? buildDateSearchTokens(row.endedAt) : "en curso",
      ]
        .filter(Boolean)
        .join(" ")
    );

    return queryTerms.every((term) => searchable.includes(term));
  });
}

export function summarizeSessionsByDay(rows = [], nowMs = Date.now()) {
  const list = Array.isArray(rows) ? rows : [];
  const dayMap = new Map();

  for (const row of list) {
    const dateKey = toLocalDateKey(row?.startedAt);
    if (!dateKey) continue;

    const elapsed = getSessionElapsedSeconds(row, nowMs);
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

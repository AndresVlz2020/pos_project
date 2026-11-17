import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { M3Icon, IconButton } from "@/shared";
import { getSessionHistory, formatDuration } from "@/services/sessionService";
import { getUsers } from "@/services/userService";
import {
  toLocalDateKey,
  getSessionElapsedSeconds,
  formatTotalHours,
  extractWorkerOptions,
  filterSessionRows,
  summarizeSessionsByDay,
} from "@/shared/utils/sessionHistoryHelpers";

const DATE_PRESETS = [
  { value: "all", label: "Todas las fechas" },
  { value: "today", label: "Hoy" },
  { value: "7d", label: "Últimos 7 días" },
  { value: "month", label: "Este mes" },
];

export default function SessionHistoryModal({ isOpen, onClose, isAdmin = false }) {
  const [rows, setRows] = useState([]);
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [loadedAtMs, setLoadedAtMs] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [specificDate, setSpecificDate] = useState("");
  const [viewMode, setViewMode] = useState("sessions");
  const [nowMs, setNowMs] = useState(() => Date.now());

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const [historyData, usersData] = await Promise.all([
        getSessionHistory(),
        isAdmin ? getUsers().catch(() => []) : Promise.resolve([]),
      ]);
      const syncMs = Date.now();
      setRows(Array.isArray(historyData) ? historyData : []);
      setDirectoryUsers(Array.isArray(usersData) ? usersData : []);
      setLoadedAtMs(syncMs);
      setNowMs(syncMs);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    Promise.resolve().then(async () => {
      if (!active) return;
      await loadHistory();
    });
    return () => {
      active = false;
    };
  }, [isOpen, loadHistory]);

  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isOpen]);

  if (!isOpen) return null;

  const workers = isAdmin ? extractWorkerOptions(rows, directoryUsers) : [];
  const selectedWorker = workers.find((w) => w.id === selectedWorkerId) || null;

  const filtered = filterSessionRows(rows, {
    workerId: isAdmin ? selectedWorkerId : "",
    datePreset,
    specificDate,
    nowMs,
  });

  const totalSeconds = filtered.reduce(
    (sum, row) => sum + getSessionElapsedSeconds(row, nowMs, loadedAtMs),
    0
  );

  const todayKey = toLocalDateKey(nowMs);
  const todaySeconds = filtered.reduce((sum, row) => {
    if (toLocalDateKey(row.startedAt) !== todayKey) return sum;
    return sum + getSessionElapsedSeconds(row, nowMs, loadedAtMs);
  }, 0);

  const dailySummary = summarizeSessionsByDay(filtered, nowMs, loadedAtMs);
  const maxDaySeconds = Math.max(
    1,
    ...dailySummary.map((day) => day.totalSeconds)
  );

  const hasWorkerFilter = Boolean(isAdmin && selectedWorkerId);
  const hasDateFilter = Boolean(specificDate) || datePreset !== "all";
  const hasAnyFilter = hasWorkerFilter || hasDateFilter;

  const handleClearDateFilter = () => {
    setSpecificDate("");
    setDatePreset("all");
  };

  const handleClearAllFilters = () => {
    setSelectedWorkerId("");
    handleClearDateFilter();
  };

  const handleSelectDayFromSummary = (dateKey) => {
    setSpecificDate(dateKey);
    setDatePreset("all");
    setViewMode("sessions");
  };

  const formatDateTime = (iso) => {
    if (!iso) return "En curso";
    return new Date(iso).toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--md-sys-color-scrim)] backdrop-blur-xs p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="dpiero-modal-in bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] rounded-[28px] m3-elevation-3 w-full max-w-4xl max-h-[88dvh] flex flex-col overflow-hidden text-[var(--md-sys-color-on-surface)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
              <M3Icon name="schedule" size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl leading-8 font-medium truncate">
                {isAdmin ? "Historial de Turnos del Personal" : "Mi Historial de Turnos"}
              </h2>
              <p className="text-xs leading-4 text-[var(--md-sys-color-on-surface-variant)] truncate">
                {isAdmin
                  ? selectedWorker
                    ? `Turnos y horas acumuladas de ${selectedWorker.userName}.`
                    : "Entradas, salidas y horas trabajadas del personal."
                  : "Consulta tus turnos y horas acumuladas."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <IconButton
              ariaLabel="Actualizar historial"
              title="Actualizar"
              variant="tonal"
              onClick={loadHistory}
            >
              <M3Icon
                name="refresh"
                size={20}
                className={loading ? "animate-spin" : ""}
              />
            </IconButton>
            <IconButton
              ariaLabel="Cerrar historial"
              title="Cerrar"
              variant="standard"
              onClick={onClose}
            >
              <M3Icon name="close" size={20} />
            </IconButton>
          </div>
        </div>

        {/* Selección por trabajador (Admin) + filtro de fecha */}
        <div className="px-6 py-3 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] flex flex-col sm:flex-row sm:items-center gap-2.5">
          {isAdmin && (
            <div className="relative flex-1 min-w-0 flex items-center">
              <M3Icon
                name="group"
                size={18}
                className="text-[var(--md-sys-color-on-surface-variant)] absolute left-3 pointer-events-none"
              />
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                aria-label="Filtrar por trabajador"
                className="m3-outlined-field w-full h-10 pl-9 pr-3 text-sm bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] outline-none cursor-pointer truncate"
              >
                <option value="">Todos los trabajadores ({workers.length})</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.userName} ({worker.userType || "Personal"})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div
            className={`flex items-center gap-2 shrink-0 ${
              !isAdmin ? "sm:ml-auto" : ""
            }`}
          >
            <select
              value={specificDate ? "custom" : datePreset}
              onChange={(e) => {
                const next = e.target.value;
                if (next === "custom") return;
                setSpecificDate("");
                setDatePreset(next);
              }}
              aria-label="Rango de fechas"
              className="m3-outlined-field h-10 px-3 text-sm bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] outline-none cursor-pointer"
            >
              {DATE_PRESETS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
              {specificDate && <option value="custom">Día puntual</option>}
            </select>

            <div className="relative flex items-center">
              <M3Icon
                name="calendar_today"
                size={16}
                className="text-[var(--md-sys-color-on-surface-variant)] absolute left-2.5 pointer-events-none sm:hidden"
              />
              <input
                type="date"
                value={specificDate}
                max={todayKey}
                onChange={(e) => {
                  setSpecificDate(e.target.value);
                  if (e.target.value) setDatePreset("all");
                }}
                aria-label="Filtrar por día específico"
                title="Filtrar por día específico"
                className="m3-outlined-field h-10 pl-8 sm:pl-3 pr-2.5 text-sm bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] outline-none dark:[color-scheme:dark] cursor-pointer"
              />
            </div>

            {hasAnyFilter && (
              <IconButton
                ariaLabel="Limpiar filtros"
                title="Limpiar filtros"
                variant="tonal"
                onClick={handleClearAllFilters}
              >
                <M3Icon name="close" size={18} />
              </IconButton>
            )}
          </div>
        </div>

        {/* Sumatoria + Segmented Button M3 Turnos / Por día */}
        <div className="px-6 py-3 border-b border-[var(--md-sys-color-outline-variant)] flex flex-wrap items-center justify-between gap-3 bg-[var(--md-sys-color-surface-container-low)]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Total horas:</span>
              <span className="font-mono text-sm font-medium text-[var(--md-sys-color-primary)]">
                {formatTotalHours(totalSeconds)}
              </span>
              <span className="font-mono text-xs text-[var(--md-sys-color-on-surface-variant)]">
                ({formatDuration(totalSeconds)} · {filtered.length}{" "}
                {filtered.length === 1 ? "turno" : "turnos"})
              </span>
            </div>

            {(!specificDate || specificDate === todayKey) && (
              <div className="flex items-baseline gap-1 text-[var(--md-sys-color-on-surface-variant)]">
                <span>Hoy:</span>
                <span className="font-mono font-medium text-[var(--md-sys-color-on-surface)]">
                  {formatTotalHours(todaySeconds)}
                </span>
              </div>
            )}
          </div>

          <div
            role="tablist"
            aria-label="Modo de visualización de turnos"
            className="inline-flex rounded-full border border-[var(--md-sys-color-outline)] overflow-hidden divide-x divide-[var(--md-sys-color-outline)] shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "sessions"}
              onClick={() => setViewMode("sessions")}
              className={`m3-state h-10 px-4 text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--md-sys-color-primary)] ${
                viewMode === "sessions"
                  ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                  : "bg-transparent text-[var(--md-sys-color-on-surface)]"
              }`}
            >
              {viewMode === "sessions" && <M3Icon name="check" size={16} />}
              Por turnos
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "daily"}
              onClick={() => setViewMode("daily")}
              className={`m3-state h-10 px-4 text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--md-sys-color-primary)] ${
                viewMode === "daily"
                  ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                  : "bg-transparent text-[var(--md-sys-color-on-surface)]"
              }`}
            >
              {viewMode === "daily" && <M3Icon name="check" size={16} />}
              Horas al día ({dailySummary.length})
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          {loading && rows.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
              Cargando historial de turnos...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--md-sys-color-on-surface-variant)] space-y-2">
              <p>
                {selectedWorker
                  ? `No hay turnos registrados para ${selectedWorker.userName} con el filtro seleccionado.`
                  : "No hay turnos que coincidan con el filtro seleccionado."}
              </p>
              {hasAnyFilter && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="inline-flex items-center min-h-[40px] px-4 rounded-full text-sm font-medium text-[var(--md-sys-color-primary)] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : viewMode === "daily" ? (
            <div className="space-y-2.5">
              {dailySummary.map((day) => {
                const ratio = Math.min(
                  100,
                  Math.max(4, Math.round((day.totalSeconds / maxDaySeconds) * 100))
                );
                return (
                  <div
                    key={day.dateKey}
                    className="rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleSelectDayFromSummary(day.dateKey)}
                          className="inline-flex items-center min-h-[40px] px-2 -mx-2 rounded-lg text-sm font-medium text-[var(--md-sys-color-on-surface)] hover:text-[var(--md-sys-color-primary)] capitalize cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
                          title="Ver turnos de este día"
                        >
                          {day.label}
                        </button>
                        <span className="text-xs px-2.5 py-0.5 rounded-lg bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]">
                          {day.sessionCount} {day.sessionCount === 1 ? "turno" : "turnos"}
                        </span>
                        {day.activeCount > 0 && (
                          <span className="text-xs px-2.5 py-0.5 rounded-lg bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-medium">
                            {day.activeCount} en curso
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-sm font-medium text-[var(--md-sys-color-primary)]">
                          {formatTotalHours(day.totalSeconds)}
                        </div>
                        <div className="font-mono text-xs text-[var(--md-sys-color-on-surface-variant)]">
                          {formatDuration(day.totalSeconds)}
                        </div>
                      </div>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-[var(--md-sys-color-surface-container-highest)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--md-sys-color-primary)]"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>

                    {isAdmin && day.users.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {day.users.map((u) => (
                          <button
                            key={u.userKey}
                            type="button"
                            onClick={() =>
                              setSelectedWorkerId((prev) =>
                                prev === u.userKey ? "" : u.userKey
                              )
                            }
                            title={
                              selectedWorkerId === u.userKey
                                ? "Mostrar todos los trabajadores"
                                : `Ver solo horas de ${u.userName}`
                            }
                            className={`m3-state inline-flex items-center gap-1.5 min-h-[40px] text-xs px-3 py-1 rounded-lg border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                              selectedWorkerId === u.userKey
                                ? "bg-[var(--md-sys-color-secondary-container)] border-transparent text-[var(--md-sys-color-on-secondary-container)]"
                                : "bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]"
                            }`}
                          >
                            <span className="font-medium">{u.userName}</span>
                            <span className="opacity-60">·</span>
                            <span className="font-mono text-[var(--md-sys-color-primary)]">
                              {formatTotalHours(u.totalSeconds)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div className="sm:hidden space-y-2.5">
                {filtered.map((row) => {
                  const elapsed = getSessionElapsedSeconds(row, nowMs, loadedAtMs);
                  return (
                    <div
                      key={row.id}
                      className="rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] p-3.5 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        {isAdmin ? (
                          <span className="font-medium text-[var(--md-sys-color-on-surface)] truncate">
                            {row.userName} ({row.userType || "Personal"})
                          </span>
                        ) : (
                          <span className="font-mono font-medium text-[var(--md-sys-color-on-surface)]">
                            {formatDuration(elapsed)}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                            row.isActive
                              ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
                              : "bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]"
                          }`}
                        >
                          {row.isActive ? "En turno" : "Finalizada"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                        <div>
                          <span className="opacity-70 block">Inicio:</span>
                          <span className="font-mono">{formatDateTime(row.startedAt)}</span>
                        </div>
                        <div>
                          <span className="opacity-70 block">Fin:</span>
                          <span className="font-mono">{formatDateTime(row.endedAt)}</span>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                          Duración:{" "}
                          <span className="font-mono font-medium text-[var(--md-sys-color-on-surface)]">
                            {formatDuration(elapsed)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface-variant)] uppercase">
                      {isAdmin && <th className="py-3 pr-3 font-medium">Colaborador</th>}
                      <th className="py-3 pr-3 font-medium">Inicio</th>
                      <th className="py-3 pr-3 font-medium">Fin</th>
                      <th className="py-3 pr-3 font-medium">Duración</th>
                      <th className="py-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/60">
                    {filtered.map((row) => {
                      const elapsed = getSessionElapsedSeconds(row, nowMs, loadedAtMs);
                      return (
                        <tr key={row.id} className="hover:bg-[var(--md-sys-color-surface-container)]">
                          {isAdmin && (
                            <td className="py-2.5 pr-3">
                              <button
                                type="button"
                                onClick={() =>
                                  row.userId &&
                                  setSelectedWorkerId((prev) =>
                                    prev === String(row.userId) ? "" : String(row.userId)
                                  )
                                }
                                title={
                                  selectedWorkerId === String(row.userId)
                                    ? "Mostrar todos los trabajadores"
                                    : `Filtrar por ${row.userName}`
                                }
                                className="min-h-[40px] px-2 -mx-2 text-left cursor-pointer group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
                              >
                                <div className="font-medium text-[var(--md-sys-color-on-surface)] group-hover:text-[var(--md-sys-color-primary)]">
                                  {row.userName}
                                </div>
                                <div className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                                  {row.userType || "Personal"}
                                </div>
                              </button>
                            </td>
                          )}
                          <td className="py-2.5 pr-3 font-mono text-xs text-[var(--md-sys-color-on-surface)]">
                            {formatDateTime(row.startedAt)}
                          </td>
                          <td className="py-2.5 pr-3 font-mono text-xs text-[var(--md-sys-color-on-surface-variant)]">
                            {formatDateTime(row.endedAt)}
                          </td>
                          <td className="py-2.5 pr-3 font-mono text-xs font-medium text-[var(--md-sys-color-on-surface)]">
                            {formatDuration(elapsed)}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                row.isActive
                                  ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
                                  : "bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]"
                              }`}
                            >
                              {row.isActive ? "En turno" : "Finalizada"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

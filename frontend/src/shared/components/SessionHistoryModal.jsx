import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Clock, X, RefreshCw, Search, Calendar } from "lucide-react";
import { getSessionHistory, formatDuration } from "@/services/sessionService";
import {
  toLocalDateKey,
  getSessionElapsedSeconds,
  formatTotalHours,
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [specificDate, setSpecificDate] = useState("");
  const [viewMode, setViewMode] = useState("sessions");
  const [nowMs, setNowMs] = useState(() => Date.now());

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSessionHistory();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Refrescar segundos en vivo para sesiones activas dentro del modal
  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = filterSessionRows(rows, {
    search,
    datePreset,
    specificDate,
    nowMs,
  });

  const totalSeconds = filtered.reduce(
    (sum, row) => sum + getSessionElapsedSeconds(row, nowMs),
    0
  );

  const todayKey = toLocalDateKey(nowMs);
  const todaySeconds = filtered.reduce((sum, row) => {
    if (toLocalDateKey(row.startedAt) !== todayKey) return sum;
    return sum + getSessionElapsedSeconds(row, nowMs);
  }, 0);

  const dailySummary = summarizeSessionsByDay(filtered, nowMs);
  const maxDaySeconds = Math.max(
    1,
    ...dailySummary.map((day) => day.totalSeconds)
  );

  const hasDateFilter = Boolean(specificDate) || datePreset !== "all";

  const handleClearDateFilter = () => {
    setSpecificDate("");
    setDatePreset("all");
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-700)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col text-[var(--color-white)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-[var(--color-secondary-800)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Clock className="size-5 text-[var(--color-primary-400)] shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base font-bold truncate">
                {isAdmin ? "Historial de Turnos del Personal" : "Mi Historial de Turnos"}
              </h2>
              <p className="text-xs text-[var(--color-gray-400)] truncate">
                {isAdmin
                  ? "Entradas, salidas y horas trabajadas del personal."
                  : "Consulta tus turnos y horas acumuladas."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={loadHistory}
              className="p-2 rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-secondary-700)] text-[var(--color-gray-300)] cursor-pointer transition"
              title="Actualizar"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-secondary-700)] text-[var(--color-gray-300)] cursor-pointer transition"
              title="Cerrar"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Barra de búsqueda + pequeño filtro de fecha */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-[var(--color-secondary-800)] bg-[var(--color-secondary-950)]/50 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="size-3.5 text-[var(--color-gray-400)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="session-history-search"
              autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isAdmin
                  ? "Buscar por colaborador, cargo, fecha (ej. 15/11) o estado..."
                  : "Buscar por fecha (ej. 15/11) o estado..."
              }
              aria-label="Buscar turnos"
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-[var(--color-secondary-950)] border border-[var(--color-secondary-700)] text-[var(--color-white)] placeholder:text-[var(--color-gray-500)] focus:outline-none focus:border-[var(--color-primary-500)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)] hover:text-[var(--color-white)] cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={specificDate ? "custom" : datePreset}
              onChange={(e) => {
                const next = e.target.value;
                if (next === "custom") return;
                setSpecificDate("");
                setDatePreset(next);
              }}
              aria-label="Rango de fechas"
              className="px-2.5 py-1.5 text-xs rounded-lg bg-[var(--color-secondary-950)] border border-[var(--color-secondary-700)] text-[var(--color-white)] focus:outline-none focus:border-[var(--color-primary-500)] cursor-pointer"
            >
              {DATE_PRESETS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
              {specificDate && <option value="custom">Día puntual</option>}
            </select>

            <div className="relative flex items-center">
              <Calendar className="size-3.5 text-[var(--color-gray-400)] absolute left-2.5 pointer-events-none sm:hidden" />
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
                className="pl-7 sm:pl-2.5 pr-2 py-1.5 text-xs rounded-lg bg-[var(--color-secondary-950)] border border-[var(--color-secondary-700)] text-[var(--color-white)] focus:outline-none focus:border-[var(--color-primary-500)] dark:[color-scheme:dark] cursor-pointer"
              />
            </div>

            {hasDateFilter && (
              <button
                type="button"
                onClick={handleClearDateFilter}
                className="p-1.5 rounded-lg border border-[var(--color-secondary-700)] bg-[var(--color-secondary-800)] hover:bg-[var(--color-secondary-700)] text-[var(--color-gray-300)] cursor-pointer transition"
                title="Quitar filtro de fecha"
                aria-label="Quitar filtro de fecha"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Franja compacta de sumatoria total + selector Turnos / Por día */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-[var(--color-secondary-800)] flex flex-wrap items-center justify-between gap-2 bg-[var(--color-secondary-900)]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[var(--color-gray-400)]">Total horas:</span>
              <span className="font-mono text-sm font-bold text-[var(--color-primary-300)]">
                {formatTotalHours(totalSeconds)}
              </span>
              <span className="font-mono text-[11px] text-[var(--color-gray-400)]">
                ({formatDuration(totalSeconds)} · {filtered.length}{" "}
                {filtered.length === 1 ? "turno" : "turnos"})
              </span>
            </div>

            {(!specificDate || specificDate === todayKey) && (
              <div className="flex items-baseline gap-1 text-[var(--color-gray-400)]">
                <span>Hoy:</span>
                <span className="font-mono font-semibold text-[var(--color-white)]">
                  {formatTotalHours(todaySeconds)}
                </span>
              </div>
            )}
          </div>

          <div
            role="tablist"
            aria-label="Modo de visualización de turnos"
            className="inline-flex rounded-lg p-0.5 bg-[var(--color-secondary-950)] border border-[var(--color-secondary-700)] shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "sessions"}
              onClick={() => setViewMode("sessions")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition ${
                viewMode === "sessions"
                  ? "bg-[var(--color-primary-500)] text-[#ffffff]"
                  : "text-[var(--color-gray-300)] hover:text-[var(--color-white)]"
              }`}
            >
              Por turnos
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "daily"}
              onClick={() => setViewMode("daily")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition ${
                viewMode === "daily"
                  ? "bg-[var(--color-primary-500)] text-[#ffffff]"
                  : "text-[var(--color-gray-300)] hover:text-[var(--color-white)]"
              }`}
            >
              Horas al día ({dailySummary.length})
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5">
          {loading && rows.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--color-gray-400)]">
              Cargando historial de turnos...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--color-gray-400)] space-y-2">
              <p>No hay turnos que coincidan con el filtro seleccionado.</p>
              {(search || hasDateFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    handleClearDateFilter();
                  }}
                  className="text-xs font-semibold text-[var(--color-primary-400)] hover:underline cursor-pointer"
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
                    className="rounded-lg border border-[var(--color-secondary-800)] bg-[var(--color-secondary-950)]/60 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleSelectDayFromSummary(day.dateKey)}
                          className="text-xs sm:text-sm font-semibold text-[var(--color-white)] hover:text-[var(--color-primary-300)] capitalize cursor-pointer transition text-left"
                          title="Ver turnos de este día"
                        >
                          {day.label}
                        </button>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--color-secondary-800)] text-[var(--color-gray-300)]">
                          {day.sessionCount} {day.sessionCount === 1 ? "turno" : "turnos"}
                        </span>
                        {day.activeCount > 0 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--color-primary-500)]/15 text-[var(--color-primary-300)] border border-[var(--color-primary-500)]/30">
                            {day.activeCount} en curso
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-xs sm:text-sm font-bold text-[var(--color-primary-300)]">
                          {formatTotalHours(day.totalSeconds)}
                        </div>
                        <div className="font-mono text-[10px] text-[var(--color-gray-400)]">
                          {formatDuration(day.totalSeconds)}
                        </div>
                      </div>
                    </div>

                    {/* Barra sutil de carga horaria */}
                    <div className="h-1.5 w-full rounded-full bg-[var(--color-secondary-800)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--color-primary-500)] transition-all duration-300"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>

                    {isAdmin && day.users.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {day.users.map((u) => (
                          <span
                            key={u.userKey}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] text-[var(--color-gray-300)]"
                          >
                            <span className="font-medium text-[var(--color-white)]">
                              {u.userName}
                            </span>
                            <span className="text-[var(--color-gray-500)]">·</span>
                            <span className="font-mono text-[var(--color-primary-300)]">
                              {formatTotalHours(u.totalSeconds)}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              {/* Tarjetas en teléfono */}
              <div className="sm:hidden space-y-2.5">
                {filtered.map((row) => {
                  const elapsed = getSessionElapsedSeconds(row, nowMs);
                  return (
                    <div
                      key={row.id}
                      className="rounded-lg border border-[var(--color-secondary-800)] bg-[var(--color-secondary-950)]/70 p-3 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        {isAdmin ? (
                          <span className="font-semibold text-[var(--color-white)] truncate">
                            {row.userName} ({row.userType || "Personal"})
                          </span>
                        ) : (
                          <span className="font-mono font-semibold text-[var(--color-white)]">
                            {formatDuration(elapsed)}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 ${
                            row.isActive
                              ? "bg-[var(--color-primary-500)]/15 text-[var(--color-primary-400)] border-[var(--color-primary-500)]/40"
                              : "bg-[var(--color-secondary-800)] text-[var(--color-secondary-200)] border-[var(--color-secondary-600)]"
                          }`}
                        >
                          {row.isActive ? "En turno" : "Finalizada"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--color-gray-300)]">
                        <div>
                          <span className="text-[var(--color-gray-500)] block">Inicio:</span>
                          <span className="font-mono">{formatDateTime(row.startedAt)}</span>
                        </div>
                        <div>
                          <span className="text-[var(--color-gray-500)] block">Fin:</span>
                          <span className="font-mono">{formatDateTime(row.endedAt)}</span>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="text-[11px] text-[var(--color-gray-400)]">
                          Duración:{" "}
                          <span className="font-mono font-semibold text-[var(--color-white)]">
                            {formatDuration(elapsed)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tabla en tablet y escritorio */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-secondary-800)] text-[var(--color-gray-400)] uppercase">
                      {isAdmin && <th className="py-2 pr-3">Colaborador</th>}
                      <th className="py-2 pr-3">Inicio</th>
                      <th className="py-2 pr-3">Fin</th>
                      <th className="py-2 pr-3">Duración</th>
                      <th className="py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-secondary-800)]">
                    {filtered.map((row) => {
                      const elapsed = getSessionElapsedSeconds(row, nowMs);
                      return (
                        <tr key={row.id} className="hover:bg-[var(--color-secondary-800)]/40">
                          {isAdmin && (
                            <td className="py-2.5 pr-3">
                              <div className="font-semibold text-[var(--color-white)]">
                                {row.userName}
                              </div>
                              <div className="text-[11px] text-[var(--color-gray-400)]">
                                {row.userType || "Personal"}
                              </div>
                            </td>
                          )}
                          <td className="py-2.5 pr-3 font-mono text-[var(--color-gray-200)]">
                            {formatDateTime(row.startedAt)}
                          </td>
                          <td className="py-2.5 pr-3 font-mono text-[var(--color-gray-300)]">
                            {formatDateTime(row.endedAt)}
                          </td>
                          <td className="py-2.5 pr-3 font-mono font-semibold text-[var(--color-white)]">
                            {formatDuration(elapsed)}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                row.isActive
                                  ? "bg-[var(--color-primary-500)]/15 text-[var(--color-primary-400)] border-[var(--color-primary-500)]/40"
                                  : "bg-[var(--color-secondary-800)] text-[var(--color-secondary-200)] border-[var(--color-secondary-600)]"
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

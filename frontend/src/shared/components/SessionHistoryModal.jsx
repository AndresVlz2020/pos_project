import { useEffect, useState } from "react";
import { Clock, X, RefreshCw } from "lucide-react";
import { getSessionHistory, formatDuration } from "@/services/sessionService";

export default function SessionHistoryModal({ isOpen, onClose, isAdmin = false }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [, setTick] = useState(0);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getSessionHistory();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadHistory();
  }, [isOpen]);

  // Refrescar segundos en vivo para sesiones activas dentro del modal
  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (r.userName || "").toLowerCase().includes(q) ||
      (r.userType || "").toLowerCase().includes(q)
    );
  });

  const formatDateTime = (iso) => {
    if (!iso) return "En curso";
    return new Date(iso).toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-700)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col text-[var(--color-white)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-secondary-800)]">
          <div className="flex items-center gap-2.5">
            <Clock className="size-5 text-[var(--color-primary-400)]" />
            <div>
              <h2 className="text-base font-bold">
                {isAdmin ? "Historial de Sesiones del Personal" : "Mi Historial de Sesiones"}
              </h2>
              <p className="text-xs text-[var(--color-gray-400)]">
                {isAdmin
                  ? "Registro en tiempo real de entradas, salidas y duración de turnos."
                  : "Consulta tus tiempos de conexión y turnos registrados."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Buscador para admin */}
        {isAdmin && (
          <div className="px-5 py-3 border-b border-[var(--color-secondary-800)] bg-[var(--color-secondary-950)]/50">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por nombre o cargo..."
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[var(--color-secondary-950)] border border-[var(--color-secondary-700)] text-[var(--color-white)] placeholder:text-[var(--color-gray-500)] focus:outline-none focus:border-[var(--color-primary-500)]"
            />
          </div>
        )}

        {/* Tabla / Tarjetas */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5">
          {loading && rows.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--color-gray-400)]">
              Cargando historial de sesiones...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--color-gray-400)]">
              No hay sesiones registradas todavía.
            </div>
          ) : (
            <>
              {/* Tarjetas en teléfono */}
              <div className="sm:hidden space-y-2.5">
                {filtered.map((row) => {
                  const elapsed = row.isActive
                    ? Math.max(0, Math.floor((Date.now() - new Date(row.startedAt).getTime()) / 1000))
                    : row.durationSeconds;
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
                          Duración: <span className="font-mono font-semibold text-[var(--color-white)]">{formatDuration(elapsed)}</span>
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
                      const elapsed = row.isActive
                        ? Math.max(0, Math.floor((Date.now() - new Date(row.startedAt).getTime()) / 1000))
                        : row.durationSeconds;
                      return (
                        <tr key={row.id} className="hover:bg-[var(--color-secondary-800)]/40">
                          {isAdmin && (
                            <td className="py-2.5 pr-3">
                              <div className="font-semibold text-[var(--color-white)]">{row.userName}</div>
                              <div className="text-[11px] text-[var(--color-gray-400)]">{row.userType || "Personal"}</div>
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
    </div>
  );
}

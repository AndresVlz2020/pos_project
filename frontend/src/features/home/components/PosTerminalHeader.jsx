import { Link } from "react-router-dom";

export default function PosTerminalHeader({ 
  station = "Terminal Central", 
  operator = "Administrador General"
}) {
  return (
    <header className="w-full bg-[var(--color-primary-950)] border-b border-[var(--color-primary-800)] py-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Barra superior del POS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-bold text-[var(--color-white)] tracking-tight">
              Punto de Venta
            </h1>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-[var(--color-primary-800)] text-[var(--color-gray-300)] font-medium border border-[var(--color-primary-700)]">
                {station}
              </span>
              <span className="px-2 py-0.5 rounded bg-[var(--color-primary-800)] text-[var(--color-secondary-300)] font-medium border border-[var(--color-primary-700)]">
                Op: {operator}
              </span>
            </div>
          </div>
        </div>

        {/* Métricas Operativas Limpias (KPIs) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-md px-3.5 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-gray-400)] font-medium">
              Venta de Turno
            </p>
            <p className="text-base sm:text-lg font-bold text-[var(--color-white)] tracking-tight mt-0.5">
              $1.480.000
            </p>
          </div>

          <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-md px-3.5 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-gray-400)] font-medium">
              Comandas Cocina
            </p>
            <p className="text-base sm:text-lg font-bold text-[var(--color-white)] tracking-tight mt-0.5">
              4 activas
            </p>
          </div>

          <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-md px-3.5 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-gray-400)] font-medium">
              Mesas Ocupadas
            </p>
            <p className="text-base sm:text-lg font-bold text-[var(--color-white)] tracking-tight mt-0.5">
              8 / 16 mesas
            </p>
          </div>

          <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-md px-3.5 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-gray-400)] font-medium">
              Estado Sistema
            </p>
            <p className="text-base sm:text-lg font-bold text-[var(--color-white)] tracking-tight mt-0.5">
              En línea
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

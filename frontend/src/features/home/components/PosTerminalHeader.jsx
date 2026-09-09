import { Link } from "react-router-dom";
import { UtensilsCrossed, ReceiptText, ShieldCheck, Users, Store, DollarSign } from "lucide-react";

export default function PosTerminalHeader({ activeShift = "Tarde / Noche", station = "Caja #01 Salón" }) {
  return (
    <div className="w-full bg-[var(--color-primary-950)] border-b border-[var(--color-primary-800)] px-4 sm:px-6 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Barra superior de estado de la estación */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-[var(--color-primary-800)] border border-[var(--color-primary-700)] flex items-center justify-center text-[var(--color-secondary-400)] shadow-inner">
              <Store className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-white)] tracking-tight">
                  Terminal Punto de Venta (POS)
                </h1>
              </div>
              <p className="text-xs text-[var(--color-gray-300)] mt-0.5">
                Estación: <strong className="text-[var(--color-white)] font-medium">{station}</strong> • Turno: <strong className="text-[var(--color-white)] font-medium">{activeShift}</strong> • Operador: <strong className="text-[var(--color-secondary-300)] font-medium">Carlos Pérez</strong>
              </p>
            </div>
          </div>

          {/* Accesos rápidos de la estación */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/CreateOrder"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-xs sm:text-sm font-semibold text-[var(--color-white)] shadow-md transition-colors"
            >
              <UtensilsCrossed className="size-4" />
              Nueva Comanda / Orden
            </Link>
            <Link
              to="/productList"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--color-primary-800)] hover:bg-[var(--color-primary-700)] border border-[var(--color-primary-600)] text-xs sm:text-sm font-medium text-[var(--color-gray-200)] hover:text-[var(--color-white)] transition-colors"
            >
              <ReceiptText className="size-4 text-[var(--color-secondary-400)]" />
              Catálogo Completo
            </Link>
          </div>
        </div>

        {/* Métricas Operativas de la Estación con 100% variables de diseño */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-xl p-3.5 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-[var(--color-primary-800)] border border-[var(--color-primary-700)] flex items-center justify-center text-[var(--color-secondary-300)]">
              <DollarSign className="size-5" />
            </div>
            <div>
              <p className="text-[11px] text-[var(--color-gray-400)] font-medium">Venta de Turno</p>
              <p className="text-base sm:text-lg font-bold text-[var(--color-white)]">$1.480.000</p>
            </div>
          </div>

          <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-xl p-3.5 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-[var(--color-primary-800)] border border-[var(--color-primary-700)] flex items-center justify-center text-[var(--color-secondary-400)]">
              <UtensilsCrossed className="size-5" />
            </div>
            <div>
              <p className="text-[11px] text-[var(--color-gray-400)] font-medium">Comandas en Cocina</p>
              <p className="text-base sm:text-lg font-bold text-[var(--color-white)]">4 activas</p>
            </div>
          </div>

          <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-xl p-3.5 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-[var(--color-primary-800)] border border-[var(--color-primary-700)] flex items-center justify-center text-[var(--color-secondary-400)]">
              <Store className="size-5" />
            </div>
            <div>
              <p className="text-[11px] text-[var(--color-gray-400)] font-medium">Mesas Ocupadas</p>
              <p className="text-base sm:text-lg font-bold text-[var(--color-white)]">8 / 16 mesas</p>
            </div>
          </div>

          <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-xl p-3.5 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-[var(--color-primary-800)] border border-[var(--color-primary-700)] flex items-center justify-center text-[var(--color-secondary-400)]">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-[11px] text-[var(--color-gray-400)] font-medium">Personal en Turno</p>
              <p className="text-base sm:text-lg font-bold text-[var(--color-white)]">4 operadores</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

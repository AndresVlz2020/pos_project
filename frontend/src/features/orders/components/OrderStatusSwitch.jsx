import { Ban, CheckCircle2, Clock } from "lucide-react";
import { normalizeOrderStatus } from "../utils/orderFormHelpers";

export default function OrderStatusSwitch({
  label = "Estado de la Orden *",
  value = "No Pagada",
  onChange,
  disabled = false,
}) {
  const normalized = normalizeOrderStatus(value);
  const isUnpaid = normalized === "No Pagada";
  const isPaid = normalized === "Pagada";
  const isCanceled = normalized === "Anulada";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        {label && (
          <span className="block text-[length:var(--fs-xxxs)] font-semibold text-[var(--color-gray-300)]">
            {label}
          </span>
        )}
        {isCanceled && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error-border)]">
            <Ban className="w-3 h-3" />
            Anulada
          </span>
        )}
      </div>

      <div
        role="group"
        aria-label={label || "Estado de la Orden"}
        className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[var(--color-secondary-950)] border border-[var(--color-secondary-700)]"
      >
        <button
          type="button"
          aria-pressed={isUnpaid}
          disabled={disabled}
          onClick={() => {
            if (!disabled) onChange?.("No Pagada");
          }}
          className={`min-h-[40px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 ${
            isUnpaid
              ? "bg-[var(--color-primary-500)]/15 border border-[var(--color-primary-500)]/40 text-[var(--color-primary-400)] shadow-xs"
              : "border border-transparent text-[var(--color-gray-400)] hover:text-[var(--color-white)] hover:bg-[var(--color-secondary-900)]"
          } ${disabled ? "opacity-55 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span>No Pagada</span>
        </button>

        <button
          type="button"
          aria-pressed={isPaid}
          disabled={disabled}
          onClick={() => {
            if (!disabled) onChange?.("Pagada");
          }}
          className={`min-h-[40px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 ${
            isPaid
              ? "bg-[var(--color-primary-500)]/15 border border-[var(--color-primary-500)]/40 text-[var(--color-primary-400)] shadow-xs"
              : "border border-transparent text-[var(--color-gray-400)] hover:text-[var(--color-white)] hover:bg-[var(--color-secondary-900)]"
          } ${disabled ? "opacity-55 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Pagada</span>
        </button>
      </div>

      <p className="text-[11px] text-[var(--color-gray-400)] leading-snug">
        {isCanceled
          ? "La orden fue anulada y no admite cambios."
          : isPaid
            ? "Cierra la orden, libera la mesa y habilita la factura."
            : "La cuenta sigue abierta y la mesa continúa ocupada."}
      </p>
    </div>
  );
}

import { M3Icon } from "@/shared";
import { normalizeOrderStatus } from "../utils/orderFormHelpers";

/** Selector de estado de la orden según Material Design 3 Segmented Button. */
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
          <span className="block text-label-md font-medium text-[var(--md-sys-color-on-surface-variant)]">
            {label}
          </span>
        )}
        {isCanceled && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-medium bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border border-[var(--md-sys-color-error)]/40">
            <M3Icon name="block" size={14} />
            Anulada
          </span>
        )}
      </div>

      {/* M3 Segmented Button (h-10 / 40dp, pill container with outline border and divider) */}
      <div
        role="group"
        aria-label={label || "Estado de la Orden"}
        className="grid grid-cols-2 rounded-full border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] overflow-hidden divide-x divide-[var(--md-sys-color-outline)]"
      >
        <button
          type="button"
          aria-pressed={isUnpaid}
          disabled={disabled}
          onClick={() => {
            if (!disabled) onChange?.("No Pagada");
          }}
          className={`m3-state min-h-[40px] flex items-center justify-center gap-2 py-2 px-4 text-label-lg font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--md-sys-color-primary)] ${
            isUnpaid
              ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
              : "bg-transparent text-[var(--md-sys-color-on-surface)]"
          } ${disabled ? "opacity-38 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
        >
          <M3Icon name={isUnpaid ? "check" : "schedule"} size={18} />
          <span>No Pagada</span>
        </button>

        <button
          type="button"
          aria-pressed={isPaid}
          disabled={disabled}
          onClick={() => {
            if (!disabled) onChange?.("Pagada");
          }}
          className={`m3-state min-h-[40px] flex items-center justify-center gap-2 py-2 px-4 text-label-lg font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--md-sys-color-primary)] ${
            isPaid
              ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
              : "bg-transparent text-[var(--md-sys-color-on-surface)]"
          } ${disabled ? "opacity-38 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
        >
          <M3Icon name={isPaid ? "check" : "check_circle"} filled={isPaid} size={18} />
          <span>Pagada</span>
        </button>
      </div>

      <p className="text-body-sm text-[var(--md-sys-color-on-surface-variant)]">
        {isCanceled
          ? "La orden fue anulada y no admite cambios."
          : isPaid
            ? "Cierra la orden, libera la mesa y habilita la factura."
            : "La cuenta sigue abierta y la mesa continúa ocupada."}
      </p>
    </div>
  );
}

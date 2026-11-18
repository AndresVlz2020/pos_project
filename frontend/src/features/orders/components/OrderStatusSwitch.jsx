import { M3Icon } from "@/shared";
import {
  getOrderStatusStepIndex,
  normalizeOrderStatus,
} from "../utils/orderFormHelpers";

const STATUS_OPTIONS = [
  { value: "Creada", label: "Creada", icon: "schedule" },
  { value: "Completada", label: "Completada", icon: "task_alt" },
  { value: "Entregada", label: "Entregada", icon: "room_service" },
  { value: "Pagada", label: "Pagada", icon: "check_circle" },
];

/**
 * Selector M3 Segmented Button de 4 estados operativos
 * (Creada / Completada / Entregada / Pagada) con bloqueo de retroceso secuencial
 * y control de permisos por rol.
 */
export default function OrderStatusSwitch({
  label = "Estado de la Orden *",
  value = "Creada",
  currentStatus,
  onChange,
  disabled = false,
  canMarkCreated = true,
  canMarkCompleted = true,
  canMarkDelivered = true,
  canMarkPaid = true,
}) {
  const normalized = normalizeOrderStatus(value);
  const persistedStatus = normalizeOrderStatus(currentStatus ?? value);
  const currentStepIndex = getOrderStatusStepIndex(persistedStatus);
  const isCanceled = normalized === "Anulada" || persistedStatus === "Anulada";

  const isBackwardStatus = (optionValue) => {
    const optionStepIndex = getOrderStatusStepIndex(optionValue);
    return (
      currentStepIndex >= 0 &&
      optionStepIndex >= 0 &&
      optionStepIndex < currentStepIndex
    );
  };

  const isOptionDisabled = (optionValue) => {
    if (disabled || isCanceled) return true;
    if (isBackwardStatus(optionValue)) return true;
    if (optionValue === "Creada") return !canMarkCreated && normalized !== "Creada";
    if (optionValue === "Completada") return !canMarkCompleted && normalized !== "Completada";
    if (optionValue === "Entregada") return !canMarkDelivered && normalized !== "Entregada";
    if (optionValue === "Pagada") return !canMarkPaid;
    return false;
  };

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

      <div
        role="group"
        aria-label={label || "Estado de la Orden"}
        className="grid grid-cols-2 sm:grid-cols-4 rounded-2xl sm:rounded-full border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-[var(--md-sys-color-outline)]"
      >
        {STATUS_OPTIONS.map((opt) => {
          const isSelected = normalized === opt.value;
          const isBackward = isBackwardStatus(opt.value);
          const optDisabled = isOptionDisabled(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={isSelected}
              disabled={optDisabled}
              title={
                isBackward
                  ? "No es posible retroceder a un estado anterior"
                  : undefined
              }
              onClick={() => {
                if (!optDisabled) onChange?.(opt.value);
              }}
              className={`m3-state min-h-[42px] flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--md-sys-color-primary)] ${
                isSelected
                  ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                  : "bg-transparent text-[var(--md-sys-color-on-surface)]"
              } ${optDisabled ? "opacity-38 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
            >
              <M3Icon
                name={isSelected ? "check" : opt.icon}
                filled={isSelected}
                size={16}
              />
              <span className="truncate">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

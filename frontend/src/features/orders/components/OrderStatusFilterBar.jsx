import { M3Icon } from "@/shared";
import {
  ORDER_STATUS_VALUES,
  getOrderStatusBadgeMeta,
} from "../utils/orderFormHelpers";

/**
 * Barra horizontal M3 de chips filtrantes por estado canónico de orden.
 */
export default function OrderStatusFilterBar({
  value = "all",
  onChange,
  counts = {},
  className = "",
}) {
  const chips = [
    { key: "all", label: "Todas", icon: "receipt_long" },
    ...ORDER_STATUS_VALUES.map((st) => {
      const meta = getOrderStatusBadgeMeta(st);
      return { key: st, label: meta.label, icon: meta.icon };
    }),
  ];

  return (
    <div
      role="group"
      aria-label="Filtrar órdenes por estado"
      className={`flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none ${className}`}
    >
      {chips.map((chip) => {
        const active = value === chip.key;
        return (
          <button
            key={chip.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange?.(chip.key)}
            className={`m3-state inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-full text-label-md font-medium border shrink-0 transition-colors cursor-pointer ${
              active
                ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border-[var(--md-sys-color-secondary)]/40"
                : "bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)]"
            }`}
          >
            <M3Icon name={active ? "check" : chip.icon} size={16} />
            <span>{chip.label}</span>
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-label-sm bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] tabular-nums">
              {counts[chip.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

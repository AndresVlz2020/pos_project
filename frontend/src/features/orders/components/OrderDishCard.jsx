import { IconButton, M3Icon } from "@/shared";
import { getProductImage, imgPunta } from "@/utils/imageHelper";

/**
 * Tarjeta compacta M3 de platillo para Crear/Editar Orden:
 * - Nombre completo arriba
 * - Imagen abajo a la izquierda con código en una esquina
 * - Stock, precio y controles (- / +) abajo a la derecha sin ampliar altura
 */
export default function OrderDishCard({
  dish,
  count = 0,
  maxStock,
  disabled = false,
  className = "",
  onIncrement,
  onDecrement,
}) {
  const isInactive = dish.status === "Inactivo";
  const stockValue = Math.max(0, Math.floor(Number(dish.stock ?? 0)));
  const effectiveMax =
    maxStock !== undefined && maxStock !== null
      ? Math.max(0, Math.floor(Number(maxStock)))
      : stockValue;
  const isOutOfStock = !isInactive && effectiveMax <= 0;
  const isAtMaxStock = count >= effectiveMax;

  return (
    <div
      className={`p-2.5 sm:p-3 rounded-2xl border transition-colors flex flex-col justify-between gap-2 ${
        isInactive || (isOutOfStock && count === 0)
          ? "bg-[var(--md-sys-color-surface-container-highest)]/40 border-[var(--md-sys-color-outline-variant)] opacity-60"
          : count > 0
          ? "bg-[var(--md-sys-color-primary-container)]/30 border-[var(--md-sys-color-primary)] m3-elevation-1"
          : "bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-primary)]/60"
      } ${className}`}
    >
      {/* Nombre del platillo arriba con ancho completo */}
      <h4
        title={dish.name}
        className={`text-sm leading-5 font-medium line-clamp-1 ${
          isInactive
            ? "text-[var(--md-sys-color-on-surface-variant)]"
            : "text-[var(--md-sys-color-on-surface)]"
        }`}
      >
        {dish.name}
      </h4>

      {/* Imagen con código en esquina + Precio/Stock y botones -/+ abajo */}
      <div className="flex items-end justify-between gap-2.5">
        <div className="relative w-20 h-14 rounded-xl overflow-hidden border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shrink-0">
          <img
            src={getProductImage(dish)}
            alt={dish.name}
            className={`w-full h-full object-cover transition duration-150 ${
              isInactive || isOutOfStock ? "grayscale contrast-75" : ""
            }`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = imgPunta;
            }}
          />
          {dish.code && (
            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-mono leading-none tracking-tight backdrop-blur-xs">
              {dish.code}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col items-end justify-between gap-1">
          <div className="flex items-center justify-end gap-2 w-full flex-wrap">
            <span
              className={`text-[11px] leading-4 font-medium tabular-nums ${
                isInactive || isOutOfStock
                  ? "text-[var(--md-sys-color-error)]"
                  : isAtMaxStock && count > 0
                  ? "text-[var(--color-warning)]"
                  : "text-[var(--md-sys-color-on-surface-variant)]"
              }`}
            >
              {isInactive
                ? "Inactivo"
                : isOutOfStock
                ? "Agotado"
                : `Disp: ${effectiveMax}`}
            </span>
            <span
              className={`text-sm font-semibold tabular-nums ${
                isInactive
                  ? "text-[var(--md-sys-color-outline)]"
                  : "text-[var(--md-sys-color-primary)]"
              }`}
            >
              ${Number(dish.price || 0).toLocaleString("es-CO")}
            </span>
          </div>

          <div className="inline-flex items-center gap-0.5 bg-[var(--md-sys-color-surface-container-high)] p-0.5 rounded-full border border-[var(--md-sys-color-outline-variant)] shrink-0">
            <IconButton
              type="button"
              variant="standard"
              hitSize={40}
              iconSize={18}
              disabled={disabled || count === 0}
              onClick={() => onDecrement?.(dish)}
              ariaLabel={`Disminuir ${dish.name}`}
            >
              <M3Icon name="remove" size={18} />
            </IconButton>
            <span className="text-sm font-semibold w-6 text-center text-[var(--md-sys-color-on-surface)] tabular-nums">
              {count}
            </span>
            <IconButton
              type="button"
              variant="tonal"
              hitSize={40}
              iconSize={18}
              disabled={disabled || isInactive || isOutOfStock || isAtMaxStock}
              onClick={() => onIncrement?.(dish)}
              ariaLabel={`Aumentar ${dish.name}`}
            >
              <M3Icon name="add" size={18} />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}

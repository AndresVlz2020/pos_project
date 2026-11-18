import { M3Icon } from "@/shared";
import { getProductImage, imgPunta } from "@/utils/imageHelper";

export default function PosProductCard({ product, onSelect }) {
  const { title, name, price, description, status } = product || {};
  const displayName = title || name || "Platillo";
  const formattedPrice = Number(price || 0).toLocaleString("es-CO");
  const image = getProductImage(product);

  const isInhabilitado =
    status === "Inactivo" ||
    status === "inhabilitado" ||
    status === "No disponible" ||
    product?.is_active === false;

  const handleActivate = () => {
    onSelect?.(product);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActivate();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${displayName}`}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      className={`group rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] overflow-hidden flex flex-col justify-between cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
        isInhabilitado
          ? "opacity-65"
          : "m3-elevation-1 hover:m3-elevation-2 hover:border-[var(--md-sys-color-primary)]"
      }`}
    >
      <div>
        <div className="relative w-full h-32 sm:h-44 overflow-hidden bg-[var(--md-sys-color-surface-container)]">
          <img
            src={image}
            alt={displayName}
            className={`w-full h-full object-cover transition-transform duration-200 ${
              isInhabilitado ? "grayscale" : "group-hover:scale-105"
            }`}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = imgPunta;
            }}
          />
          {!isInhabilitado && (
            <div className="hidden sm:flex items-center gap-1.5 absolute bottom-2 right-2 px-3 py-1 rounded-full bg-black/75 text-white text-label-sm font-medium backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <M3Icon name="visibility" size={14} className="text-white" />
              <span>Ver detalle</span>
            </div>
          )}
          {isInhabilitado && (
            <div className="absolute top-2.5 right-2.5 bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <M3Icon name="block" size={14} />
              Inhabilitado
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 space-y-1">
          <h3 className="text-base leading-6 font-medium text-[var(--md-sys-color-on-surface)] line-clamp-1 group-hover:text-[var(--md-sys-color-primary)]">
            {displayName}
          </h3>
          <p className="line-clamp-1 sm:line-clamp-2 text-xs leading-4 text-[var(--md-sys-color-on-surface-variant)]">
            {description}
          </p>
        </div>
      </div>

      <div className="p-3 sm:p-4 pt-0">
        <div className="pt-2.5 border-t border-[var(--md-sys-color-outline-variant)] flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-label-sm text-[var(--md-sys-color-on-surface-variant)] uppercase font-medium block">
              Precio
            </span>
            <span className="text-base leading-6 font-bold text-[var(--md-sys-color-on-surface)] tabular-nums">
              ${formattedPrice} COP
            </span>
          </div>

          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
              isInhabilitado
                ? "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
                : "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
            }`}
          >
            {isInhabilitado ? "No disponible" : "Disponible"}
          </span>
        </div>
      </div>
    </div>
  );
}

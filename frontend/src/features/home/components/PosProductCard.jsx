import { Ban, Eye } from "lucide-react";
import { getProductImage, imgPunta } from "@/utils/imageHelper";

export default function PosProductCard({ product, onSelect }) {
  const { title, name, price, description, status } = product || {};
  const displayName = title || name || "Platillo";
  const formattedPrice = Number(price || 0).toLocaleString("es-CO");
  const image = getProductImage(product);

  // Regla de negocio: excluir platillo inhabilitado de órdenes manteniendo visibilidad (RFADMIN23)
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
      className={`group rounded-xl border border-[var(--color-secondary-800)] bg-[var(--color-secondary-900)] text-[var(--color-white)] transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] ${
        isInhabilitado
          ? "opacity-75 hover:border-[var(--color-secondary-700)]"
          : "hover:border-[var(--color-primary-500)] hover:-translate-y-0.5 shadow-xs hover:shadow-md"
      }`}
    >
      <div>
        {/* Imagen del plato con badge si está inhabilitado */}
        <div className="relative w-full h-28 sm:h-44 overflow-hidden bg-[var(--color-secondary-950)]">
          <img
            src={image}
            alt={displayName}
            className={`w-full h-full object-cover transition-transform duration-200 ${
              isInhabilitado ? "grayscale" : "group-hover:scale-105"
            }`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = imgPunta;
            }}
          />
          {!isInhabilitado && (
            <div className="hidden sm:flex items-center gap-1 absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/65 text-[var(--color-on-primary)] text-xs font-semibold border border-[var(--color-on-primary)]/20 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Eye className="size-3 text-[var(--color-primary-300)]" />
              <span>Ver detalle</span>
            </div>
          )}
          {isInhabilitado && (
            <div className="absolute top-2.5 right-2.5 bg-[var(--color-secondary-800)] text-[var(--color-gray-300)] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[var(--color-secondary-700)] shadow-md flex items-center gap-1">
              <Ban className="size-3" />
              Inhabilitado
            </div>
          )}
        </div>

        {/* Información del Producto */}
        <div className="p-3 sm:p-4 space-y-1 sm:space-y-1.5">
          <h3 className="text-base leading-6 font-bold text-[var(--color-white)] line-clamp-1 group-hover:text-[var(--color-primary-300)] transition-colors">
            {displayName}
          </h3>
          <p className="line-clamp-1 sm:line-clamp-2 text-xs leading-4 text-[var(--color-gray-400)]">
            {description}
          </p>
        </div>
      </div>

      {/* Footer de Tarjeta con Precio y Botón de Venta POS */}
      <div className="p-3 sm:p-4 pt-0">
        <div className="pt-2.5 border-t border-[var(--color-secondary-800)] flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-label-sm text-[var(--color-gray-400)] uppercase font-medium block">
              Precio
            </span>
            <span className="text-base leading-6 font-bold text-[var(--color-white)]">
              ${formattedPrice} COP
            </span>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              isInhabilitado
                ? "bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error-border)]"
                : "bg-[var(--color-primary-500)]/15 text-[var(--color-primary-300)] border border-[var(--color-primary-500)]/40"
            }`}
          >
            {isInhabilitado ? "No disponible" : "Disponible"}
          </span>
        </div>
      </div>
    </div>
  );
}

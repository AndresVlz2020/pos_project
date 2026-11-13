import { Ban } from "lucide-react";
import { getProductImage, imgPunta } from "@/utils/imageHelper";

export default function PosProductCard({ product }) {
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

  return (
    <div
      className={`group rounded-lg border border-[var(--color-secondary-800)] bg-[var(--color-secondary-900)] text-[var(--color-white)] transition-colors duration-150 overflow-hidden flex flex-col justify-between ${
        isInhabilitado
          ? "opacity-75"
          : "hover:border-[var(--color-primary-500)]"
      }`}
    >
      <div>
        {/* Imagen del plato con badge si está inhabilitado */}
        <div className="relative w-full h-44 overflow-hidden bg-[var(--color-secondary-950)]">
          <img
            src={image}
            alt={displayName}
            className={`w-full h-full object-cover transition-transform duration-200 ${
              isInhabilitado ? "grayscale" : "group-hover:scale-102"
            }`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = imgPunta;
            }}
          />
          {isInhabilitado && (
            <div className="absolute top-2.5 right-2.5 bg-[var(--color-secondary-800)] text-[var(--color-gray-300)] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--color-secondary-700)] shadow-md flex items-center gap-1">
              <Ban className="size-3" />
              Inhabilitado
            </div>
          )}
        </div>

        {/* Información del Producto */}
        <div className="p-3.5 space-y-1.5">
          <h3 className="text-[length:var(--fs-xxs)] font-bold text-[var(--color-white)] line-clamp-1 group-hover:text-[var(--color-primary-300)] transition-colors">
            {displayName}
          </h3>
          <p className="text-[length:var(--fs-xxxs)] text-[var(--color-gray-400)] line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Footer de Tarjeta con Precio y Botón de Venta POS */}
      <div className="p-3.5 pt-0">
        <div className="pt-2.5 border-t border-[var(--color-secondary-800)] flex items-center justify-between gap-2">
          <div>
            <span className="text-[length:var(--fs-xxxxs)] text-[var(--color-gray-400)] uppercase font-medium block">
              Precio
            </span>
            <span className="text-[length:var(--fs-xs)] font-bold text-[var(--color-white)]">
              ${formattedPrice} COP
            </span>
          </div>

          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
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

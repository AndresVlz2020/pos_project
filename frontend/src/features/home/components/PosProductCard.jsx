import { ChevronRight, Ban } from "lucide-react";
import { Link } from "react-router-dom";

export default function PosProductCard({ product }) {
  const { title, price, description, image, status } = product || {};
  const formattedPrice = Number(price || 0).toLocaleString("es-CO");

  // Regla de negocio: excluir platillo inhabilitado de órdenes manteniendo visibilidad (RFADMIN23)
  const isInhabilitado =
    status === "Inactivo" ||
    status === "inhabilitado" ||
    status === "No disponible";

  return (
    <div
      className={`group rounded-lg border border-[var(--color-secondary-800)] bg-[var(--color-secondary-900)] text-[var(--color-white)] transition-colors duration-150 overflow-hidden flex flex-col justify-between ${
        isInhabilitado
          ? "opacity-75 border-red-500/30"
          : "hover:border-[var(--color-primary-500)]"
      }`}
    >
      <div>
        {/* Imagen del plato con badge si está inhabilitado */}
        <div className="relative w-full h-44 overflow-hidden bg-[var(--color-secondary-950)]">
          <img
            src={image}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-200 ${
              isInhabilitado ? "grayscale-50" : "group-hover:scale-102"
            }`}
            loading="lazy"
          />
          {isInhabilitado && (
            <div className="absolute top-2.5 right-2.5 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-400 shadow-md flex items-center gap-1">
              <Ban className="size-3" />
              Inhabilitado
            </div>
          )}
        </div>

        {/* Información del Producto */}
        <div className="p-3.5 space-y-1.5">
          <h3 className="text-[length:var(--fs-xxs)] font-bold text-[var(--color-white)] line-clamp-1 group-hover:text-[var(--color-primary-300)] transition-colors">
            {title}
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
            <span className="text-[length:var(--fs-xs)] font-bold text-[var(--color-primary-300)]">
              ${formattedPrice}
            </span>
          </div>

          {isInhabilitado ? (
            <span className="inline-flex items-center text-[11px] font-semibold text-red-400 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">
              No disponible
            </span>
          ) : (
            <Link
              to="/CreateOrder"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-500)] text-[length:var(--fs-xxxs)] font-semibold text-[var(--color-white)] border border-[var(--color-secondary-700)] hover:border-transparent transition-colors cursor-pointer"
              title="Agregar orden con este platillo"
            >
              <ChevronRight className="size-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

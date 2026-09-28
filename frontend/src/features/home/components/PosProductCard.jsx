import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function PosProductCard({ product }) {
  const { title, price, description, image } = product || {};
  const formattedPrice = Number(price || 0).toLocaleString("es-CO");

  return (
    <div className="group rounded-lg border border-[var(--color-primary-800)] bg-[var(--color-primary-900)] hover:border-[var(--color-secondary-500)] text-[var(--color-white)] transition-colors duration-150 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Imagen del plato limpia sin badges ni etiquetas */}
        <div className="relative w-full h-44 overflow-hidden bg-[var(--color-primary-950)]">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-102"
            loading="lazy"
          />
        </div>

        {/* Información del Producto */}
        <div className="p-3.5 space-y-1.5">
          <h3 className="text-[length:var(--fs-xxs)] font-bold text-[var(--color-white)] line-clamp-1 group-hover:text-[var(--color-secondary-300)] transition-colors">
            {title}
          </h3>
          <p className="text-[length:var(--fs-xxxs)] text-[var(--color-gray-400)] line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Footer de Tarjeta con Precio y Botón de Venta POS */}
      <div className="p-3.5 pt-0">
        <div className="pt-2.5 border-t border-[var(--color-primary-800)] flex items-center justify-between gap-2">
          <div>
            <span className="text-[length:var(--fs-xxxxs)] text-[var(--color-gray-400)] uppercase font-medium block">Precio</span>
            <span className="text-[length:var(--fs-xs)] font-bold text-[var(--color-secondary-300)]">
              ${formattedPrice}
            </span>
          </div>

          <Link
            to="/CreateOrder"
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-[var(--color-primary-800)] hover:bg-[var(--color-secondary-500)] text-[length:var(--fs-xxxs)] font-semibold text-[var(--color-white)] border border-[var(--color-primary-700)] hover:border-transparent transition-colors cursor-pointer"
          >
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

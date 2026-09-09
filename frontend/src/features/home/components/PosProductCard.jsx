import { Plus, Check, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";

export default function PosProductCard({ product, onAddToOrder }) {
  const { code, title, price, description, image, category, stock = 20, status = "Disponible" } = product || {};

  const formattedPrice = Number(price || 0).toLocaleString("es-CO");

  return (
    <div className="group rounded-xl border border-[var(--color-primary-800)] bg-[var(--color-primary-900)] hover:border-[var(--color-secondary-400)]/60 text-[var(--color-white)] shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Imagen del plato / producto */}
        <div className="relative w-full h-44 overflow-hidden bg-[var(--color-primary-950)]">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-950)] via-transparent to-black/30 pointer-events-none" />

          {/* Badges superiores: Código SKU y Categoría */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            {code && (
              <span className="bg-[var(--color-primary-950)]/90 backdrop-blur-sm text-[var(--color-secondary-300)] text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-[var(--color-primary-700)] shadow-sm">
                {code}
              </span>
            )}
            <span className="bg-black/70 backdrop-blur-sm text-[var(--color-gray-200)] text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md border border-white/10 shadow-sm">
              {category}
            </span>
          </div>

          {/* Stock disponible en cocina/barra */}
          <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5">
            <span className="bg-[var(--color-primary-900)]/95 text-[11px] font-medium text-[var(--color-gray-200)] px-2 py-0.5 rounded-md border border-[var(--color-primary-700)]">
              Stock: <strong className="text-[var(--color-white)]">{stock}</strong> uds
            </span>
          </div>
        </div>

        {/* Información del Producto */}
        <div className="p-3.5 space-y-1.5">
          <h3 className="text-sm font-bold text-[var(--color-white)] line-clamp-1 group-hover:text-[var(--color-secondary-300)] transition-colors">
            {title}
          </h3>
          <p className="text-xs text-[var(--color-gray-300)] line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Footer de Tarjeta con Precio y Botón de Venta POS */}
      <div className="p-3.5 pt-0">
        <div className="pt-2.5 border-t border-[var(--color-primary-800)] flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-[var(--color-gray-400)] block">Precio venta</span>
            <span className="text-base font-extrabold text-[var(--color-secondary-300)]">
              ${formattedPrice}
            </span>
          </div>

          <Link
            to="/CreateOrder"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-primary-800)] hover:bg-[var(--color-secondary-500)] text-xs font-semibold text-[var(--color-white)] border border-[var(--color-primary-700)] hover:border-transparent transition-colors cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Comanda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

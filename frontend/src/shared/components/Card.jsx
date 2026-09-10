import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Card = ({
  product,
  qty,
  onIncrement,
  onDecrement,
  orderLink,
  children,
  className = ""
}) => {
  if (!product && !children) return null;

  const { title, name, productName, price, productPrice, image, description, productCategory, category, status, rating, isPopular } = product || {};
  const displayTitle = name || title || productName;
  const displayPrice = price || productPrice;
  const displayDesc = description || productCategory;
  const displayCategory = category || productCategory;

  const parsePrice = (val) => parseFloat(String(val || 0).replace(/\$/g, "").replace(/\./g, "").trim()) || 0;
  const numericPrice = parsePrice(displayPrice);
  const formattedPrice = numericPrice > 0 ? `$${numericPrice.toLocaleString()}` : (displayPrice ? `$${displayPrice}` : "");
  const dishSubtotal = numericPrice * (qty || 0);

  return (
    <div
      className={`
        w-full
        group
        rounded-lg
        border
        border-[var(--color-primary-800)]
        bg-[var(--color-primary-900)]
        text-[var(--color-white)]
        shadow-md
        hover:shadow-lg
        hover:border-[var(--color-secondary-500)]
        transition-all
        duration-200
        overflow-hidden
        flex
        flex-col
        justify-between
        ${className}
      `}
    >
      <div>
        {image && (
          <div className="w-full h-48 sm:h-52 overflow-hidden bg-[var(--color-primary-950)]">
            <img
              src={image}
              alt={displayTitle}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        <div className="p-4 space-y-2">
          {displayTitle && (
            <h3 className="text-[length:var(--fs-sm)] font-bold text-[var(--color-white)] line-clamp-1">
              {displayTitle}
            </h3>
          )}

          {displayDesc && (
            <p className="text-[length:var(--fs-xxs)] text-[var(--color-gray-300)] line-clamp-2">
              {displayDesc}
            </p>
          )}

          {displayPrice && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[length:var(--fs-xxs)] text-[var(--color-gray-300)]">
                Precio unitario:
              </span>
              <span className="text-[length:var(--fs-xs)] font-bold text-[var(--color-secondary-300)]">
                {formattedPrice}
              </span>
            </div>
          )}

          {typeof qty === "number" && qty > 0 && (
            <div className="flex items-center justify-between text-[length:var(--fs-xxxs)] text-[var(--color-secondary-200)] pt-1 border-t border-[var(--color-white)]/10">
              <span>Subtotal:</span>
              <span className="font-bold">${dishSubtotal.toLocaleString()}</span>
            </div>
          )}

          {children}
        </div>
      </div>

      {typeof qty === "number" && (onIncrement || onDecrement) && (
        <div className="p-4 pt-0">
          <div className="flex items-center justify-between bg-[var(--color-black)]/30 rounded-lg p-1.5 border border-[var(--color-white)]/10">
            <button
              type="button"
              onClick={onDecrement}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-[var(--color-white)] font-bold text-[length:var(--fs-sm)] cursor-pointer transition-colors"
            >
              -
            </button>

            <span className="font-bold text-[length:var(--fs-xs)] text-[var(--color-white)] px-2">
              {qty}
            </span>

            <button
              type="button"
              onClick={onIncrement}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-[var(--color-white)] font-bold text-[length:var(--fs-sm)] cursor-pointer transition-colors"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Botón minimalista gris cuadrado con > para hacer el pedido */}
      {orderLink && typeof qty !== "number" && (
        <div className="p-4 pt-0 mt-auto">
          <div className="pt-2.5 border-t border-[var(--color-primary-800)] flex items-center justify-between">
            <span className="text-[length:var(--fs-xxs)] font-medium text-[var(--color-gray-400)]">
              Hacer pedido
            </span>
            <Link
              to={orderLink}
              aria-label={`Hacer pedido de ${displayTitle}`}
              className="inline-flex items-center justify-center size-7 rounded-md bg-[var(--color-primary-800)] border border-[var(--color-primary-700)] text-[var(--color-gray-300)] hover:bg-[var(--color-primary-700)] hover:text-[var(--color-white)] hover:border-[var(--color-primary-600)] transition-colors cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;

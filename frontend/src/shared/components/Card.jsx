import React from "react";

const Card = ({
  product,
  qty,
  onIncrement,
  onDecrement,
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
    </div>
  );
};

export default Card;

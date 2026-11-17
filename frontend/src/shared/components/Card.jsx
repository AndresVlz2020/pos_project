import { getProductImage, imgPunta } from "@/utils/imageHelper";
import M3Icon from "./M3Icon";

const Card = ({
  product,
  qty,
  onIncrement,
  onDecrement,
  children,
  className = "",
}) => {
  if (!product && !children) return null;

  const {
    title,
    name,
    productName,
    price,
    productPrice,
    description,
    productCategory,
    category,
    status,
    rating,
    isPopular,
  } = product || {};

  const displayTitle = name || title || productName;
  const displayPrice = price || productPrice;
  const displayDesc = description || productCategory;
  const displayCategory = category || productCategory;
  const imageSrc = getProductImage(product);

  const parsePrice = (val) =>
    parseFloat(String(val || 0).replace(/\$/g, "").replace(/\./g, "").trim()) || 0;
  const numericPrice = parsePrice(displayPrice);
  const formattedPrice =
    numericPrice > 0
      ? `$${numericPrice.toLocaleString()}`
      : displayPrice
      ? `$${displayPrice}`
      : "";
  const dishSubtotal = numericPrice * (qty || 0);

  const isDisabled =
    status === "Inactivo" ||
    status === "inhabilitado" ||
    status === "No disponible";

  return (
    <div
      className={`
        w-full group rounded-xl border border-[var(--md-sys-color-outline-variant)]
        bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)]
        m3-elevation-1 hover:m3-elevation-2 hover:border-[var(--md-sys-color-primary)]
        overflow-hidden flex flex-col justify-between
        ${className}
      `}
    >
      <div>
        <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-[var(--md-sys-color-surface-container)]">
          <img
            src={imageSrc}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = imgPunta;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
            {displayCategory && (
              <span className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] text-xs font-medium px-2.5 py-0.5 rounded-lg border border-[var(--md-sys-color-outline-variant)] m3-elevation-1">
                {displayCategory}
              </span>
            )}
            {isPopular && (
              <span className="bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-medium px-2.5 py-0.5 rounded-lg m3-elevation-1">
                Popular
              </span>
            )}
            {!isPopular && rating && (
              <span className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] text-xs font-medium px-2.5 py-0.5 rounded-lg border border-[var(--md-sys-color-outline-variant)]">
                {rating}
              </span>
            )}
          </div>

          {status && (
            <span
              className={`absolute bottom-2 left-2.5 text-xs font-medium px-2.5 py-0.5 rounded-lg border ${
                isDisabled
                  ? "bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)]"
                  : "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-outline-variant)]"
              }`}
            >
              {status}
            </span>
          )}
        </div>

        <div className="p-4 space-y-2">
          {displayTitle && (
            <h3 className="text-base leading-6 font-medium text-[var(--md-sys-color-on-surface)] line-clamp-1">
              {displayTitle}
            </h3>
          )}

          {displayDesc && (
            <p className="text-sm leading-5 text-[var(--md-sys-color-on-surface-variant)] line-clamp-2">
              {displayDesc}
            </p>
          )}

          {displayPrice && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                Precio unitario:
              </span>
              <span className="text-base font-medium text-[var(--md-sys-color-primary)]">
                {formattedPrice}
              </span>
            </div>
          )}

          {typeof qty === "number" && qty > 0 && (
            <div className="flex items-center justify-between text-xs text-[var(--md-sys-color-primary)] pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
              <span>Subtotal:</span>
              <span className="font-medium">${dishSubtotal.toLocaleString()}</span>
            </div>
          )}

          {children}
        </div>
      </div>

      {typeof qty === "number" && (onIncrement || onDecrement) && (
        <div className="p-4 pt-0">
          {isDisabled ? (
            <div className="min-h-[40px] flex items-center justify-center bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] text-xs py-2 px-3 rounded-lg text-center font-medium">
              Inhabilitado • Excluido de órdenes
            </div>
          ) : (
            <div className="flex items-center justify-between bg-[var(--md-sys-color-surface-container)] rounded-full p-1 border border-[var(--md-sys-color-outline-variant)]">
              <button
                type="button"
                onClick={onDecrement}
                aria-label="Disminuir cantidad"
                className="m3-state size-10 flex items-center justify-center rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
              >
                <M3Icon name="remove" size={18} />
              </button>

              <span className="font-medium text-base text-[var(--md-sys-color-on-surface)] px-2 tabular-nums">
                {qty}
              </span>

              <button
                type="button"
                onClick={onIncrement}
                aria-label="Aumentar cantidad"
                className="m3-state size-10 flex items-center justify-center rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
              >
                <M3Icon name="add" size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Card;

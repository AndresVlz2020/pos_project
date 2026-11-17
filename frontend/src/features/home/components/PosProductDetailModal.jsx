import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button, M3Icon, IconButton } from "@/shared";
import { getProductImage, imgPunta } from "@/utils/imageHelper";

const CATEGORY_ICON_MAP = {
  "platos fuertes": "local_fire_department",
  entradas: "dining",
  bebidas: "local_bar",
  postres: "cake",
  guarniciones: "layers",
};

export default function PosProductDetailModal({
  product,
  isOpen = false,
  onClose,
  onOrder,
  canCreateOrder = true,
  loadingPermission = false,
}) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!isOpen) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow || "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const displayName = product.title || product.name || "Platillo D'Piero";
  const description =
    (product.description || "").trim() ||
    "Preparación artesanal de la casa D'Piero elaborada al momento con ingredientes seleccionados.";
  const unitPrice = Number(product.price || 0);
  const formattedUnitPrice = unitPrice.toLocaleString("es-CO");
  const subtotal = (unitPrice * quantity).toLocaleString("es-CO");
  const category = (product.category || "General").trim();
  const normalizedCat = category.toLowerCase();
  const categoryIconName = CATEGORY_ICON_MAP[normalizedCat] || "tag";
  const code = product.code || (product.id ? `PROD-${product.id}` : "MENÚ");
  const stockCount =
    product.stock !== undefined && product.stock !== null
      ? Math.trunc(Number(product.stock))
      : null;

  const isInhabilitado =
    product.status === "Inactivo" ||
    product.status === "inhabilitado" ||
    product.status === "No disponible" ||
    product.is_active === false;

  const isOutOfStock = stockCount !== null && stockCount <= 0;
  const maxOrderQty = stockCount !== null ? Math.max(1, stockCount) : 99;
  const orderBlocked =
    isInhabilitado || isOutOfStock || (!loadingPermission && !canCreateOrder);
  const imageSrc = getProductImage(product);

  const handleDecrease = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrease = () => setQuantity((q) => Math.min(maxOrderQty, q + 1));
  const handleConfirmOrder = () => {
    if (orderBlocked) return;
    onOrder?.(product, Math.min(quantity, maxOrderQty));
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
      onClick={() => onClose?.()}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[var(--md-sys-color-scrim)] backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="dpiero-modal-in w-full max-w-2xl max-h-[92dvh] flex flex-col overflow-hidden rounded-[28px] bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] m3-elevation-3 text-[var(--md-sys-color-on-surface)]"
      >
        {/* Cabecera visual con fotografía */}
        <div className="relative h-56 sm:h-72 w-full shrink-0 overflow-hidden bg-[var(--md-sys-color-surface-container)]">
          <img
            src={imageSrc}
            alt={displayName}
            className={`w-full h-full object-cover ${
              isInhabilitado ? "grayscale contrast-75" : ""
            }`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = imgPunta;
            }}
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/35"
          />

          <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-black/60 text-white border border-white/20 backdrop-blur-md capitalize">
                <M3Icon name={categoryIconName} size={14} className="text-white" />
                {category}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium bg-black/60 text-white/95 border border-white/20 backdrop-blur-md">
                {code}
              </span>
            </div>

            <IconButton
              ariaLabel="Cerrar detalle del platillo"
              onClick={() => onClose?.()}
              className="!bg-black/60 hover:!bg-black/80 !text-white border border-white/25 backdrop-blur-md"
            >
              <M3Icon name="close" size={20} />
            </IconButton>
          </div>

          <div className="absolute bottom-3 inset-x-4 sm:bottom-4 sm:inset-x-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {isInhabilitado ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)]">
                    <M3Icon name="block" size={14} />
                    No disponible
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]">
                    Disponible
                  </span>
                )}
              </div>

              <h2
                id="product-detail-title"
                className="text-title-lg sm:text-2xl sm:leading-8 font-medium text-white drop-shadow"
              >
                {displayName}
              </h2>
            </div>

            <div className="self-start sm:self-end shrink-0 px-3.5 py-2 rounded-xl bg-black/65 border border-white/20 backdrop-blur-md text-left sm:text-right">
              <span className="block text-label-sm uppercase tracking-wider text-white/80 font-medium leading-4">
                Precio unitario
              </span>
              <span className="text-base sm:text-title-lg font-bold text-white tabular-nums">
                ${formattedUnitPrice} COP
              </span>
            </div>
          </div>
        </div>

        {/* Contenido detallado */}
        <div className="overflow-y-auto flex-1 min-h-0 p-5 sm:p-6 space-y-4">
          <div className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              <M3Icon name="description" size={16} />
              <span>Descripción del Platillo</span>
            </div>
            <p className="text-sm sm:text-base text-[var(--md-sys-color-on-surface)] leading-relaxed">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] min-w-0">
              <span className="flex items-center gap-1.5 text-label-sm uppercase tracking-wider font-medium text-[var(--md-sys-color-on-surface-variant)]">
                <M3Icon name={categoryIconName} size={14} className="text-[var(--md-sys-color-primary)]" />
                Categoría
              </span>
              <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)] capitalize truncate mt-1">
                {category}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] min-w-0">
              <span className="flex items-center gap-1.5 text-label-sm uppercase tracking-wider font-medium text-[var(--md-sys-color-on-surface-variant)]">
                <M3Icon name="tag" size={14} className="text-[var(--md-sys-color-primary)]" />
                Código
              </span>
              <p className="text-sm font-medium font-mono text-[var(--md-sys-color-on-surface)] truncate mt-1">
                {code}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] min-w-0">
              <span className="flex items-center gap-1.5 text-label-sm uppercase tracking-wider font-medium text-[var(--md-sys-color-on-surface-variant)]">
                <M3Icon name="inventory_2" size={14} className="text-[var(--md-sys-color-primary)]" />
                Stock
              </span>
              <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate mt-1 tabular-nums">
                {stockCount !== null && stockCount > 0
                  ? `${stockCount} un.`
                  : isInhabilitado || isOutOfStock
                  ? "0 un."
                  : "En carta"}
              </p>
            </div>
          </div>

          {!isInhabilitado && isOutOfStock && (
            <div className="p-3.5 rounded-xl bg-[var(--md-sys-color-error-container)] border border-[var(--color-error-border)] text-xs text-[var(--md-sys-color-on-error-container)] flex items-start gap-2">
              <M3Icon name="error" filled size={18} className="mt-0.5" />
              <span>
                Este platillo no cuenta con stock disponible en este momento.
              </span>
            </div>
          )}

          {isInhabilitado && (
            <div className="p-3.5 rounded-xl bg-[var(--md-sys-color-error-container)] border border-[var(--color-error-border)] text-xs text-[var(--md-sys-color-on-error-container)] flex items-start gap-2">
              <M3Icon name="error" filled size={18} className="mt-0.5" />
              <span>
                Este platillo se encuentra inhabilitado temporalmente y no puede agregarse a una orden.
              </span>
            </div>
          )}

          {!isInhabilitado && !isOutOfStock && !loadingPermission && !canCreateOrder && (
            <div className="p-3.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-start gap-2">
              <M3Icon name="info" size={18} className="mt-0.5 text-[var(--md-sys-color-primary)]" />
              <span>
                Tu perfil actual solo permite consultar el catálogo y no cuenta con permiso para registrar órdenes.
              </span>
            </div>
          )}
        </div>

        {/* Barra inferior fija */}
        <div className="border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="inline-flex items-center gap-1 bg-[var(--md-sys-color-surface)] p-1 rounded-full border border-[var(--md-sys-color-outline-variant)]">
              <IconButton
                ariaLabel="Disminuir cantidad"
                variant="standard"
                onClick={handleDecrease}
                disabled={orderBlocked || quantity <= 1}
              >
                <M3Icon name="remove" size={18} />
              </IconButton>
              <span className="w-8 text-center text-base font-medium text-[var(--md-sys-color-on-surface)] tabular-nums">
                {quantity}
              </span>
              <IconButton
                ariaLabel="Aumentar cantidad"
                variant="tonal"
                onClick={handleIncrease}
                disabled={orderBlocked || quantity >= maxOrderQty}
              >
                <M3Icon name="add" size={18} />
              </IconButton>
            </div>

            <div className="text-right sm:text-left">
              <span className="block text-xs leading-4 text-[var(--md-sys-color-on-surface-variant)]">
                {quantity} {quantity === 1 ? "porción" : "porciones"}
              </span>
              <span className="text-base font-bold text-[var(--md-sys-color-on-surface)] tabular-nums">
                ${subtotal} COP
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="text"
              size="md"
              onClick={() => onClose?.()}
            >
              Cerrar
            </Button>
            <Button
              type="button"
              variant="filled"
              size="md"
              leadingIcon="shopping_bag"
              disabled={orderBlocked}
              onClick={handleConfirmOrder}
            >
              Ordenar (+{quantity})
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

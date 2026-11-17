import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Ban,
  Flame,
  UtensilsCrossed,
  Wine,
  CakeSlice,
  Layers,
  Tag,
  Package,
  Hash,
  ShoppingBag,
  Minus,
  Plus,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/shared";
import { getProductImage, imgPunta } from "@/utils/imageHelper";

const CATEGORY_ICON_MAP = {
  "platos fuertes": Flame,
  entradas: UtensilsCrossed,
  bebidas: Wine,
  postres: CakeSlice,
  guarniciones: Layers,
};

/**
 * Overlay detallado de platillo desde Home: muestra fotografía ampliada,
 * descripción completa, ficha operativa y selector rápido para enviar a Pedidos.
 */
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
  const CategoryIcon = CATEGORY_ICON_MAP[normalizedCat] || Tag;
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

  const orderBlocked = isInhabilitado || (!loadingPermission && !canCreateOrder);
  const imageSrc = getProductImage(product);

  const handleDecrease = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrease = () => setQuantity((q) => Math.min(99, q + 1));
  const handleConfirmOrder = () => {
    if (orderBlocked) return;
    onOrder?.(product, quantity);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
      onClick={() => onClose?.()}
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="dpiero-modal-in w-full max-w-2xl max-h-[92dvh] flex flex-col overflow-hidden rounded-[28px] bg-[var(--color-secondary-900)] border border-[var(--color-secondary-700)] shadow-2xl text-[var(--color-white)]"
      >
        {/* Cabecera visual con fotografía ampliada */}
        <div className="relative h-56 sm:h-72 w-full shrink-0 overflow-hidden bg-[var(--color-secondary-950)]">
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

          {/* Degradado para legibilidad constante sobre fotografía */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/35"
          />

          {/* Fila superior: Categoría + Código y botón cerrar */}
          <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/55 text-[var(--color-on-primary)] border border-[var(--color-on-primary)]/20 backdrop-blur-md capitalize">
                <CategoryIcon className="size-3.5 text-[var(--color-primary-300)]" />
                {category}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-black/55 text-[var(--color-on-primary)]/90 border border-[var(--color-on-primary)]/20 backdrop-blur-md">
                {code}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onClose?.()}
              aria-label="Cerrar detalle del platillo"
              className="size-10 rounded-full bg-black/55 hover:bg-black/80 text-[var(--color-on-primary)] border border-[var(--color-on-primary)]/25 backdrop-blur-md flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/60 transition-colors cursor-pointer shrink-0"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Información destacada al pie de la imagen */}
          <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {isInhabilitado ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-error)] text-[var(--color-on-error)] shadow-xs">
                    <Ban className="size-3" />
                    No disponible
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-primary-500)] text-[var(--color-on-primary)] shadow-xs">
                    Disponible
                  </span>
                )}
              </div>

              <h2
                id="product-detail-title"
                className="text-title-lg sm:text-2xl sm:leading-8 font-bold text-[var(--color-on-primary)] drop-shadow"
              >
                {displayName}
              </h2>
            </div>

            <div className="self-start sm:self-end shrink-0 px-3 py-1.5 rounded-xl bg-black/60 border border-[var(--color-on-primary)]/20 backdrop-blur-md text-left sm:text-right">
              <span className="block text-label-sm uppercase tracking-wider text-[var(--color-on-primary)]/80 font-semibold leading-4">
                Precio unitario
              </span>
              <span className="text-base sm:text-title-lg font-extrabold text-[var(--color-on-primary)] tabular-nums">
                ${formattedUnitPrice} COP
              </span>
            </div>
          </div>
        </div>

        {/* Contenido detallado desplazable */}
        <div className="overflow-y-auto flex-1 min-h-0 p-4 sm:p-6 space-y-4">
          {/* Descripción completa */}
          <div className="p-4 rounded-xl bg-[var(--color-secondary-950)]/65 border border-[var(--color-secondary-800)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-primary-400)]">
              <FileText className="size-3.5 shrink-0" />
              <span>Descripción del Platillo</span>
            </div>
            <p className="text-sm sm:text-base text-[var(--color-gray-200)] leading-relaxed">
              {description}
            </p>
          </div>

          {/* Ficha operativa compacta */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-[var(--color-secondary-950)]/55 border border-[var(--color-secondary-800)] min-w-0">
              <span className="flex items-center gap-1.5 text-label-sm uppercase tracking-wider font-semibold text-[var(--color-gray-400)]">
                <CategoryIcon className="size-3 text-[var(--color-primary-400)] shrink-0" />
                Categoría
              </span>
              <p className="text-sm font-bold text-[var(--color-white)] capitalize truncate mt-1">
                {category}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-secondary-950)]/55 border border-[var(--color-secondary-800)] min-w-0">
              <span className="flex items-center gap-1.5 text-label-sm uppercase tracking-wider font-semibold text-[var(--color-gray-400)]">
                <Hash className="size-3 text-[var(--color-primary-400)] shrink-0" />
                Código
              </span>
              <p className="text-sm font-bold font-mono text-[var(--color-white)] truncate mt-1">
                {code}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-secondary-950)]/55 border border-[var(--color-secondary-800)] min-w-0">
              <span className="flex items-center gap-1.5 text-label-sm uppercase tracking-wider font-semibold text-[var(--color-gray-400)]">
                <Package className="size-3 text-[var(--color-primary-400)] shrink-0" />
                Stock
              </span>
              <p className="text-sm font-bold text-[var(--color-white)] truncate mt-1 tabular-nums">
                {stockCount !== null && stockCount > 0
                  ? `${stockCount} un.`
                  : isInhabilitado
                  ? "0 un."
                  : "En carta"}
              </p>
            </div>
          </div>

          {/* Avisos contextuales de estado o permisos */}
          {isInhabilitado && (
            <div className="p-3 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error-border)] text-xs text-[var(--color-error)] flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>
                Este platillo se encuentra inhabilitado temporalmente y no puede agregarse a una orden.
              </span>
            </div>
          )}

          {!isInhabilitado && !loadingPermission && !canCreateOrder && (
            <div className="p-3 rounded-xl bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] text-xs text-[var(--color-gray-400)] flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5 text-[var(--color-primary-400)]" />
              <span>
                Tu perfil actual solo permite consultar el catálogo y no cuenta con permiso para registrar órdenes.
              </span>
            </div>
          )}
        </div>

        {/* Barra inferior fija: Selector de cantidad + Acción Ordenar */}
        <div className="border-t border-[var(--color-secondary-800)] bg-[var(--color-secondary-950)]/60 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            {/* Stepper de unidades */}
            <div className="inline-flex items-center gap-1 bg-[var(--color-secondary-900)] p-1 rounded-full border border-[var(--color-secondary-700)]">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={orderBlocked || quantity <= 1}
                aria-label="Disminuir cantidad"
                className="size-10 rounded-full flex items-center justify-center text-[var(--color-gray-300)] hover:bg-[var(--color-secondary-800)] hover:text-[var(--color-white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 disabled:opacity-35 cursor-pointer transition-colors"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center text-base font-bold text-[var(--color-white)] tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={orderBlocked}
                aria-label="Aumentar cantidad"
                className="size-10 rounded-full flex items-center justify-center text-[var(--color-primary-400)] hover:bg-[var(--color-secondary-800)] hover:text-[var(--color-primary-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 disabled:opacity-35 cursor-pointer transition-colors"
              >
                <Plus className="size-4" />
              </button>
            </div>

            {/* Resumen parcial */}
            <div className="text-right sm:text-left">
              <span className="block text-xs text-[var(--color-gray-400)] leading-tight">
                {quantity} {quantity === 1 ? "porción" : "porciones"}
              </span>
              <span className="text-base font-extrabold text-[var(--color-white)] tabular-nums">
                ${subtotal} COP
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => onClose?.()}
            >
              Cerrar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={orderBlocked}
              onClick={handleConfirmOrder}
              className="gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="size-4" />
              <span>Ordenar (+{quantity})</span>
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

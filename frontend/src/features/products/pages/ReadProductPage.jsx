import { getProductImage, imgPunta } from "@/utils/imageHelper";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/shared";
import usePermission from "@/features/access/services/usePermission";
import { getProductById } from "../services/productServices";

export default function ReadProductPage() {
  const location = useLocation();
  const { granted: canEdit } = usePermission("update_product");
  const initialProduct =
    location.state?.product ||
    (() => {
      try {
        return JSON.parse(sessionStorage.getItem("last_viewed_product") || "null");
      } catch {
        return null;
      }
    })() || {
      title: "Punta de Anca Angus 400g",
      category: "Platos Fuertes",
      price: "56000",
      description: "Corte premium a la parrilla 350g, acompañado de papas criollas y ensalada fresca.",
    };

  const [freshProduct, setFreshProduct] = useState(null);

  useEffect(() => {
    if (location.state?.product) {
      sessionStorage.setItem("last_viewed_product", JSON.stringify(location.state.product));
    }
  }, [location.state]);

  useEffect(() => {
    if (!initialProduct?.id) return undefined;
    let active = true;
    getProductById(initialProduct.id)
      .then((data) => {
        if (active && data) setFreshProduct(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [initialProduct?.id]);

  const product = freshProduct || initialProduct;

  const title = product?.title || product?.name || "Producto sin nombre";
  const category = product?.category || product?.category_name || "General";
  const price = product?.price ? Number(product.price).toLocaleString("es-CO") : "0";
  const description = product?.description || "Sin descripción adicional";
  const code = product?.code || `PROD-${product?.id || "001"}`;
  const stock = Math.max(0, Math.trunc(Number(product?.stock ?? 0)));
  const ingredients = Array.isArray(product?.ingredients) ? product.ingredients : [];
  const hasRecipe = Boolean(
    product?.hasRecipe || product?.stockMode === "recipe" || ingredients.length > 0
  );
  const isAvailable = product?.is_active ?? (product?.status === "Activo" || product?.status === "disponible");
  const isOutOfStock = stock <= 0;
  const status = !isAvailable ? "Inactivo" : isOutOfStock ? "Agotado" : "Activo (Disponible)";
  const imageSrc = getProductImage(product);

  return (
    <div className="flex-1 flex flex-col w-full font-[family-name:var(--main-font)]">
      <div className="flex-1 flex flex-col w-full bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-5 sm:p-8 m3-elevation-1 text-[var(--md-sys-color-on-surface)]">
        <div className="border-b border-[var(--md-sys-color-outline-variant)] pb-4 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-label-md font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              Código: {code}
            </span>
            <h2 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)] mt-1">
              Detalle del Platillo / Menú
            </h2>
          </div>
          <Link to="/productList">
            <Button variant="outlined" size="md" leadingIcon="arrow_back">
              Volver al Menú
            </Button>
          </Link>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          <div className="md:col-span-4 xl:col-span-3 flex justify-center">
            <img
              src={imageSrc}
              alt={title}
              className="rounded-2xl border border-[var(--md-sys-color-outline-variant)] w-full max-w-[260px] aspect-square object-cover m3-elevation-1"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = imgPunta;
              }}
            />
          </div>

          <div className="md:col-span-8 xl:col-span-9 flex flex-col p-5 sm:p-6 gap-y-4 bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl w-full">
            <h3 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">{title}</h3>
            <div className="text-body-md flex flex-col gap-3 text-[var(--md-sys-color-on-surface-variant)]">
              <p>
                Categoría:{" "}
                <span className="font-semibold text-[var(--md-sys-color-on-surface)] capitalize">
                  {category}
                </span>
              </p>
              <p>
                Descripción:{" "}
                <span className="font-normal text-[var(--md-sys-color-on-surface)]">
                  {description}
                </span>
              </p>
              <p>
                Stock disponible:{" "}
                <span className="font-semibold text-[var(--md-sys-color-on-surface)] tabular-nums">
                  {stock} un.
                </span>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-medium bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
                  {hasRecipe ? "Preparado por insumos" : "Stock directo"}
                </span>
              </p>
              <p>
                Estado:{" "}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium border ${
                    isAvailable && !isOutOfStock
                      ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)]/40"
                      : "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border-[var(--md-sys-color-error)]/40"
                  }`}
                >
                  {status}
                </span>
              </p>
              {hasRecipe && ingredients.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="text-label-md font-semibold text-[var(--md-sys-color-on-surface)] block">
                    Insumos vinculados (Receta):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ingredients.map((ing, idx) => {
                      const req = Number(ing.cantidadRequerida ?? ing.cantidad_requerida ?? 0);
                      const invStock = Number(ing.currentStock ?? 0);
                      const yieldCount = req > 0 ? Math.floor((Math.max(0, invStock) + 1e-9) / req) : 0;
                      return (
                        <div
                          key={ing.id || ing.insumoId || idx}
                          className="p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-[var(--md-sys-color-on-surface)] truncate">
                              {ing.itemName || `Insumo #${ing.insumoId}`}
                            </p>
                            <p className="text-[var(--md-sys-color-on-surface-variant)] tabular-nums">
                              Requiere {req} {ing.unitMeasure || "un."} · Stock: {invStock} {ing.unitMeasure || "un."}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full font-medium shrink-0 tabular-nums ${
                              yieldCount <= 0
                                ? "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
                                : "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]"
                            }`}
                          >
                            {yieldCount} un.
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <p className="flex items-center gap-2 pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
                Precio al público:{" "}
                <span className="font-bold text-[var(--md-sys-color-primary)] text-headline-sm tabular-nums">
                  ${price} COP
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end mt-auto gap-3 pt-6 border-t border-[var(--md-sys-color-outline-variant)]">
          <Link to="/productList">
            <Button variant="outlined" size="md" leadingIcon="arrow_back">
              Volver al Listado
            </Button>
          </Link>
          {canEdit && (
            <Link to="/editproduct" state={{ product }}>
              <Button variant="filled" size="md" leadingIcon="edit">
                Editar Platillo
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

import { getProductImage, imgPunta } from "@/utils/imageHelper";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/shared";

export default function ReadProductPage() {
  const location = useLocation();
  const product =
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

  useEffect(() => {
    if (location.state?.product) {
      sessionStorage.setItem("last_viewed_product", JSON.stringify(location.state.product));
    }
  }, [location.state]);

  const title = product?.title || product?.name || "Producto sin nombre";
  const category = product?.category || product?.category_name || "General";
  const price = product?.price ? Number(product.price).toLocaleString("es-CO") : "0";
  const description = product?.description || "Sin descripción adicional";
  const code = product?.code || `PROD-${product?.id || "001"}`;
  const stock = product?.stock ?? 0;
  const isAvailable = product?.is_active ?? (product?.status === "Activo" || product?.status === "disponible");
  const status = isAvailable ? "Activo (Disponible)" : "Inactivo";
  const imageSrc = getProductImage(product);

  return (
    <div className="my-auto py-6 font-[family-name:var(--main-font)]">
      <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] max-w-3xl mx-auto rounded-xl p-8 shadow-xl text-[var(--color-white)]">
        <div className="border-b border-[var(--color-secondary-800)] pb-4 mb-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-400)]">
              Código: {code}
            </span>
            <h2 className="text-xl font-bold text-[var(--color-white)] mt-1">
              Detalle del Platillo / Menú
            </h2>
          </div>
          <Link to="/productList">
            <Button variant="secondary" size="sm">
              Volver al Menú
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div>
            <img
              src={imageSrc}
              alt={title}
              className="rounded-lg border border-[var(--color-secondary-700)] h-56 w-56 object-cover shadow-md"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = imgPunta;
              }}
            />
          </div>

          <div className="flex flex-col px-6 py-6 gap-y-3 bg-[var(--color-secondary-800)]/70 border border-[var(--color-secondary-700)] rounded-lg flex-1">
            <h3 className="text-lg font-bold text-[var(--color-white)]">{title}</h3>
            <div className="text-sm flex flex-col gap-2.5 text-[var(--color-gray-300)]">
              <p>
                Categoría:{" "}
                <span className="font-semibold text-[var(--color-white)] capitalize">
                  {category}
                </span>
              </p>
              <p>
                Descripción:{" "}
                <span className="font-normal text-[var(--color-gray-200)]">
                  {description}
                </span>
              </p>
              <p>
                Stock disponible:{" "}
                <span className="font-semibold text-[var(--color-white)]">
                  {Math.trunc(Number(stock ?? 0))} un.
                </span>
              </p>
              <p>
                Estado:{" "}
                <span
                  className={`font-semibold ${
                    isAvailable
                      ? "text-[var(--color-primary-300)]"
                      : "text-[var(--color-error)]"
                  }`}
                >
                  {status}
                </span>
              </p>
              <p className="flex items-center gap-2 pt-2 border-t border-[var(--color-secondary-700)]">
                Precio al público:{" "}
                <span className="font-bold text-[var(--color-white)] text-xl">
                  ${price} COP
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center mt-8 gap-4 pt-4 border-t border-[var(--color-secondary-800)]">
          <Link to="/productList">
            <Button variant="secondary" size="md">
              Volver al Listado
            </Button>
          </Link>
          <Link to="/editProduct" state={{ product }}>
            <Button variant="primary" size="md">
              Editar Platillo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

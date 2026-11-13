import { useEffect } from "react";
import { Package, Warehouse, Tag, DollarSign, Calendar, FileText, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/shared";

export default function ReadInventoryPage() {
  const location = useLocation();

  const item =
    location.state?.item ||
    (() => {
      try {
        return JSON.parse(sessionStorage.getItem("last_viewed_inventory_item") || "null");
      } catch {
        return null;
      }
    })() ||
    null;

  useEffect(() => {
    if (location.state?.item) {
      sessionStorage.setItem("last_viewed_inventory_item", JSON.stringify(location.state.item));
    }
  }, [location.state]);

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto my-12 px-4 text-center font-[family-name:var(--main-font)]">
        <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-xl p-8 shadow-xl text-[var(--color-white)] space-y-4">
          <Package className="size-10 mx-auto text-[var(--color-primary-400)]" />
          <h1 className="text-lg font-bold">No se encontró información del insumo</h1>
          <p className="text-sm text-[var(--color-gray-400)]">
            Selecciona un insumo desde el listado de inventario para consultar su ficha técnica.
          </p>
          <Link to="/inventoryList">
            <Button variant="secondary" size="sm">
              Volver al Listado
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const name = item.productName || item.name || "Insumo sin nombre";
  const code = item.code || `INV-${item.id ?? "001"}`;
  const brand = item.brand || "Genérica";
  const category = item.productCategory || item.category || "General";
  const supplier = item.supplier || item.supplier_name || "No asignado";
  const description = item.description || "Insumo de inventario gastronómico.";
  const locationArea = item.location || "Almacén Central / Bodega";
  const batchNumber = item.numberBatch || item.batch_number || `LT-${item.id ?? "001"}`;
  const unit = item.unit || "un.";
  const currentStock = Number(item.currentStock ?? item.quantity ?? 0);
  const minStock = Number(item.minStock ?? 5);
  const isLowStock = currentStock <= minStock;
  const priceBuy = Number(item.priceBuy ?? 0);
  const formattedPrice = priceBuy > 0 ? `$${priceBuy.toLocaleString("es-CO")} COP` : "No registrado";

  const rawDate = item.expirationDate || item.lastUpdated || item.updated_at;
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "No registrada";

  const isActive =
    item.is_active ??
    (item.status === "Activo" ||
      (item.status !== "Inactivo" &&
        item.status !== "Vencido" &&
        item.status !== "Avería" &&
        item.status !== "Agotado" &&
        item.isActive !== false));
  const statusLabel = item.status || (isActive ? "Activo" : "Inactivo");

  return (
    <div className="max-w-4xl mx-auto my-6 px-4 font-[family-name:var(--main-font)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-white)]">Ficha del Insumo</h1>
          <p className="text-xs text-[var(--color-gray-400)] mt-0.5">
            Consulta organizada en modo lectura de existencias, proveedor y trazabilidad.
          </p>
        </div>
        <Link to="/inventoryList">
          <Button variant="secondary" size="sm">
            Volver al Listado
          </Button>
        </Link>
      </div>

      <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-xl p-6 shadow-xl text-[var(--color-white)] space-y-6">
        {/* Cabecera del insumo */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-[var(--color-secondary-800)]">
          <div className="size-20 rounded-xl border-2 border-[var(--color-secondary-700)] bg-[var(--color-secondary-950)] flex items-center justify-center shrink-0 text-[var(--color-primary-400)] shadow-md">
            <Package className="size-9" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <h2 className="text-lg font-bold text-[var(--color-white)]">{name}</h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isActive
                    ? "bg-[var(--color-primary-500)]/15 text-[var(--color-primary-400)] border-[var(--color-primary-500)]/40"
                    : "bg-[var(--color-secondary-800)] text-[var(--color-secondary-200)] border-[var(--color-secondary-600)]"
                }`}
              >
                {isActive ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                {statusLabel}
              </span>
            </div>
            <p className="text-xs text-[var(--color-gray-400)] font-mono">Código: {code}</p>
          </div>
        </div>

        {/* Sección 1: Información General */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-400)] flex items-center gap-2 mb-3">
            <Tag className="size-4" />
            1. Información General
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-lg bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] text-xs">
            <div>
              <span className="text-[var(--color-gray-400)] block">Nombre del Insumo:</span>
              <span className="font-semibold text-[var(--color-white)] text-sm">{name}</span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Marca:</span>
              <span className="font-semibold text-[var(--color-gray-200)]">{brand}</span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Categoría:</span>
              <span className="font-semibold text-[var(--color-gray-200)]">{category}</span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Proveedor Asociado:</span>
              <span className="font-semibold text-[var(--color-white)]">{supplier}</span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Código Contable:</span>
              <span className="font-semibold text-[var(--color-white)] font-mono">{code}</span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Estado Operativo:</span>
              <span className={`font-semibold ${isActive ? "text-[var(--color-primary-400)]" : "text-[var(--color-gray-300)]"}`}>
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Sección 2: Control de Stock y Costos */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-400)] flex items-center gap-2 mb-3">
            <DollarSign className="size-4" />
            2. Control de Stock y Costos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] text-xs">
            <div>
              <span className="text-[var(--color-gray-400)] block">Stock Actual:</span>
              <span
                className={`font-bold text-sm inline-flex items-center gap-1.5 mt-0.5 ${
                  isLowStock ? "text-[var(--color-primary-400)]" : "text-[var(--color-white)]"
                }`}
              >
                {currentStock} {unit}
                {isLowStock && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-[var(--color-primary-500)]/15 border border-[var(--color-primary-500)]/40">
                    <AlertTriangle className="size-3" /> Stock bajo
                  </span>
                )}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Stock Mínimo Requerido:</span>
              <span className="font-semibold text-[var(--color-gray-200)] text-sm">
                {minStock} {unit}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Precio / Costo de Compra:</span>
              <span className="font-semibold text-[var(--color-white)] font-mono text-sm">
                {formattedPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Sección 3: Ubicación y Trazabilidad */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-400)] flex items-center gap-2 mb-3">
            <Warehouse className="size-4" />
            3. Ubicación y Trazabilidad
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] text-xs">
            <div>
              <span className="text-[var(--color-gray-400)] block">Número de Lote:</span>
              <span className="font-semibold text-[var(--color-white)] font-mono">{batchNumber}</span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Ubicación en Bodega:</span>
              <span className="font-medium text-[var(--color-gray-200)]">{locationArea}</span>
            </div>
            <div>
              <span className="text-[var(--color-gray-400)] block">Fecha Vencimiento / Act.:</span>
              <span className="font-medium text-[var(--color-gray-200)] inline-flex items-center gap-1.5 mt-0.5">
                <Calendar className="size-3.5 text-[var(--color-primary-400)]" />
                {formattedDate}
              </span>
            </div>
            <div className="sm:col-span-3 pt-2 border-t border-[var(--color-secondary-800)]">
              <span className="text-[var(--color-gray-400)] flex items-center gap-1.5 mb-1">
                <FileText className="size-3.5 text-[var(--color-primary-400)]" />
                Descripción y Observaciones:
              </span>
              <p className="text-[var(--color-gray-300)] leading-relaxed">{description}</p>
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="flex justify-end pt-2 border-t border-[var(--color-secondary-800)]">
          <Link to="/inventoryList">
            <Button variant="secondary" size="md">
              Volver al Listado
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

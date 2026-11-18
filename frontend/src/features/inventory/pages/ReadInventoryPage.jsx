import { useEffect, useState } from "react";
import { M3Icon } from "@/shared";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/shared";
import { getInventoryMovements } from "../services/inventoryServices";

const MOVEMENT_BADGE_MAP = {
  SALIDA_ORDEN: {
    label: "Salida por orden",
    className:
      "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]",
  },
  ENTRADA_ANULACION: {
    label: "Reverso por anulación",
    className:
      "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]",
  },
  AJUSTE_ORDEN: {
    label: "Ajuste en orden",
    className:
      "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]",
  },
  AJUSTE_MANUAL: {
    label: "Ajuste manual",
    className:
      "bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]",
  },
};

export default function ReadInventoryPage() {
  const location = useLocation();
  const [movements, setMovements] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

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

  useEffect(() => {
    if (!item?.id) return undefined;
    let active = true;
    Promise.resolve().then(() => {
      if (active) setLoadingMovements(true);
    });
    getInventoryMovements(item.id, 30)
      .then((rows) => {
        if (active) setMovements(Array.isArray(rows) ? rows : []);
      })
      .finally(() => {
        if (active) setLoadingMovements(false);
      });
    return () => {
      active = false;
    };
  }, [item?.id]);

  if (!item) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 font-[family-name:var(--main-font)]">
        <div className="max-w-lg w-full bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-[28px] p-6 sm:p-8 m3-elevation-1 text-center text-[var(--md-sys-color-on-surface)] space-y-4">
          <div className="size-14 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center mx-auto">
            <M3Icon name="inventory_2" size={28} />
          </div>
          <h1 className="text-headline-sm font-semibold">No se encontró información del insumo</h1>
          <p className="text-body-md text-[var(--md-sys-color-on-surface-variant)]">
            Selecciona un insumo desde el listado de inventario para consultar su ficha técnica.
          </p>
          <div className="pt-2">
            <Link to="/inventoryList">
              <Button variant="filled" size="md" leadingIcon="arrow_back">
                Volver al Listado
              </Button>
            </Link>
          </div>
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
  const unit = item.unitMeasure || item.unit_measure || item.unit || "un.";
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
    <div className="flex-1 flex flex-col w-full font-[family-name:var(--main-font)]">
      <div className="flex-1 flex flex-col w-full bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-5 sm:p-8 m3-elevation-1 text-[var(--md-sys-color-on-surface)] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--md-sys-color-outline-variant)]">
          <div>
            <h1 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
              Ficha del Insumo
            </h1>
          </div>
          <Link to="/inventoryList">
            <Button variant="outlined" size="md" leadingIcon="arrow_back">
              Volver al Listado
            </Button>
          </Link>
        </div>

        {/* Cabecera del insumo */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-[var(--md-sys-color-outline-variant)]">
          <div className="size-20 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
            <M3Icon name="inventory_2" size={36} />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
              <h2 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                {name}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-label-md font-medium border ${
                  isActive
                    ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)]/40"
                    : "bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)]"
                }`}
              >
                <M3Icon name={isActive ? "check_circle" : "cancel"} size={14} />
                {statusLabel}
              </span>
            </div>
            <p className="text-label-md text-[var(--md-sys-color-on-surface-variant)] font-mono">
              Código: {code}
            </p>
          </div>
        </div>

        {/* Sección 1: Información General */}
        <div>
          <h3 className="text-label-lg font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)] flex items-center gap-2 mb-3">
            <M3Icon name="sell" size={18} />
            1. Información General
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-body-sm">
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Nombre del Insumo:</span>
              <span className="font-semibold text-[var(--md-sys-color-on-surface)] text-body-md">{name}</span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Marca:</span>
              <span className="font-semibold text-[var(--md-sys-color-on-surface)]">{brand}</span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Categoría:</span>
              <span className="font-semibold text-[var(--md-sys-color-on-surface)]">{category}</span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Proveedor Asociado:</span>
              <span className="font-semibold text-[var(--md-sys-color-on-surface)]">{supplier}</span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Código Contable:</span>
              <span className="font-semibold text-[var(--md-sys-color-on-surface)] font-mono">{code}</span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Estado Operativo:</span>
              <span
                className={`font-semibold ${
                  isActive ? "text-[var(--md-sys-color-primary)]" : "text-[var(--md-sys-color-on-surface-variant)]"
                }`}
              >
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Sección 2: Control de Stock y Costos */}
        <div>
          <h3 className="text-label-lg font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)] flex items-center gap-2 mb-3">
            <M3Icon name="attach_money" size={18} />
            2. Control de Stock y Costos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-body-sm">
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Stock Actual:</span>
              <span
                className={`font-bold text-body-md inline-flex items-center gap-2 mt-0.5 tabular-nums ${
                  isLowStock ? "text-[var(--md-sys-color-error)]" : "text-[var(--md-sys-color-on-surface)]"
                }`}
              >
                {currentStock} {unit}
                {isLowStock && (
                  <span className="inline-flex items-center gap-1 text-label-sm font-medium px-2.5 py-0.5 rounded-full bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border border-[var(--md-sys-color-error)]/40">
                    <M3Icon name="warning" size={14} /> Stock bajo
                  </span>
                )}
              </span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Stock Mínimo Requerido:</span>
              <span className="font-semibold text-[var(--md-sys-color-on-surface)] text-body-md tabular-nums">
                {minStock} {unit}
              </span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Precio / Costo de Compra:</span>
              <span className="font-semibold text-[var(--md-sys-color-on-surface)] font-mono text-body-md tabular-nums">
                {formattedPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Sección 3: Ubicación y Trazabilidad */}
        <div>
          <h3 className="text-label-lg font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)] flex items-center gap-2 mb-3">
            <M3Icon name="warehouse" size={18} />
            3. Ubicación y Trazabilidad
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-body-sm">
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Número de Lote:</span>
              <span className="font-semibold text-[var(--md-sys-color-on-surface)] font-mono">{batchNumber}</span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Ubicación en Bodega:</span>
              <span className="font-medium text-[var(--md-sys-color-on-surface)]">{locationArea}</span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block">Fecha Vencimiento / Act.:</span>
              <span className="font-medium text-[var(--md-sys-color-on-surface)] inline-flex items-center gap-1.5 mt-0.5">
                <M3Icon name="calendar_today" size={14} className="text-[var(--md-sys-color-primary)]" />
                {formattedDate}
              </span>
            </div>
            <div className="sm:col-span-3 pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
              <span className="text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5 mb-1">
                <M3Icon name="description" size={15} className="text-[var(--md-sys-color-primary)]" />
                Descripción y Observaciones:
              </span>
              <p className="text-[var(--md-sys-color-on-surface)] leading-relaxed">{description}</p>
            </div>
          </div>
        </div>

        {/* Sección 4: Historial de Movimientos */}
        <div>
          <h3 className="text-label-lg font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)] flex items-center gap-2 mb-3">
            <M3Icon name="history" size={18} />
            4. Historial de Movimientos Recientes
          </h3>
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]">
            {loadingMovements ? (
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] py-4 text-center">
                Cargando historial de movimientos...
              </p>
            ) : movements.length === 0 ? (
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] py-4 text-center">
                Aún no se registran movimientos automáticos o manuales para este insumo.
              </p>
            ) : (
              <div className="divide-y divide-[var(--md-sys-color-outline-variant)]">
                {movements.map((mov) => {
                  const meta = MOVEMENT_BADGE_MAP[mov.tipoMovimiento] || {
                    label: mov.tipoMovimiento,
                    className:
                      "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]",
                  };
                  const delta = Number(mov.cantidad || 0);
                  const sign = delta > 0 ? "+" : "";
                  return (
                    <div
                      key={mov.id}
                      className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-body-sm"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${meta.className}`}
                          >
                            {meta.label}
                          </span>
                          {mov.orderNumber && (
                            <span className="font-mono text-xs text-[var(--md-sys-color-primary)]">
                              {mov.orderNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--md-sys-color-on-surface)]">
                          {mov.observacion || mov.productName || "Movimiento de inventario"}
                        </p>
                        <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                          {mov.createdAt}
                          {mov.usuario ? ` • ${mov.usuario}` : ""}
                        </p>
                      </div>

                      <div className="text-right shrink-0 tabular-nums">
                        <span
                          className={`font-semibold text-sm block ${
                            delta < 0
                              ? "text-[var(--md-sys-color-error)]"
                              : "text-[var(--md-sys-color-primary)]"
                          }`}
                        >
                          {sign}
                          {delta} {unit}
                        </span>
                        <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                          {mov.stockAnterior} → {mov.stockNuevo} {unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pie */}
        <div className="flex justify-end mt-auto pt-4 border-t border-[var(--md-sys-color-outline-variant)]">
          <Link to="/inventoryList">
            <Button variant="outlined" size="md" leadingIcon="arrow_back">
              Volver al Listado
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

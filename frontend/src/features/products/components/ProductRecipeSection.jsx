import { useMemo } from "react";
import { Button, IconButton, Input, M3Icon, Select } from "@/shared";
import { calculateRecipeAvailableStock } from "../utils/productRecipeHelpers";

/**
 * Constructor dinámico de receta (escandallo): vincula insumos del inventario
 * al producto para calcular y descontar su stock automáticamente.
 */
export default function ProductRecipeSection({
  ingredients = [],
  onIngredientsChange,
  inventoryItems = [],
  loadingInventory = false,
  helperNote = "",
  error = "",
  disabled = false,
}) {
  const invById = useMemo(
    () => new Map((inventoryItems || []).map((item) => [String(item.id), item])),
    [inventoryItems]
  );

  const selectedIds = useMemo(
    () =>
      new Set(
        (ingredients || [])
          .map((row) => String(row?.insumoId || ""))
          .filter(Boolean)
      ),
    [ingredients]
  );

  const calculatedStock = useMemo(
    () => calculateRecipeAvailableStock(ingredients, inventoryItems),
    [ingredients, inventoryItems]
  );

  const handleRowChange = (index, field, val) => {
    const next = ingredients.map((row, idx) => {
      if (idx !== index) return row;
      if (field === "insumoId") {
        const inv = invById.get(String(val));
        return {
          ...row,
          insumoId: String(val),
          currentStock: inv ? Number(inv.currentStock ?? inv.current_stock ?? 0) : 0,
        };
      }
      return { ...row, [field]: val };
    });
    onIngredientsChange?.(next);
  };

  const handleAddRow = () => {
    const nextAvailable = (inventoryItems || []).find(
      (item) =>
        (item.isActive ?? item.is_active ?? true) &&
        !selectedIds.has(String(item.id))
    );
    onIngredientsChange?.([
      ...ingredients,
      {
        insumoId: nextAvailable ? String(nextAvailable.id) : "",
        cantidadRequerida: "1",
        currentStock: nextAvailable
          ? Number(nextAvailable.currentStock ?? nextAvailable.current_stock ?? 0)
          : 0,
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    onIngredientsChange?.(ingredients.filter((_, idx) => idx !== index));
  };

  const allInsumosUsed =
    inventoryItems.length > 0 && selectedIds.size >= inventoryItems.length;

  return (
    <div className="md:col-span-2">
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center gap-2">
            <M3Icon
              name="receipt_long"
              size={20}
              className="text-[var(--md-sys-color-primary)]"
            />
            <div>
              <h3 className="text-title-sm sm:text-base font-semibold text-[var(--md-sys-color-on-surface)]">
                Insumos Vinculados (Receta / Control Automático de Stock)
              </h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                La disponibilidad del platillo depende exclusivamente del inventario y no se edita manualmente.
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tabular-nums ${
              calculatedStock <= 0
                ? "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
                : "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
            }`}
          >
            <M3Icon
              name={calculatedStock <= 0 ? "warning" : "inventory_2"}
              size={15}
            />
            {calculatedStock <= 0
              ? "Agotado (0 un.)"
              : `Stock calculado: ${calculatedStock} un.`}
          </span>
        </div>

        {helperNote && (
          <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-start gap-2">
            <M3Icon
              name="info"
              size={16}
              className="text-[var(--md-sys-color-primary)] shrink-0 mt-0.5"
            />
            <span>{helperNote}</span>
          </div>
        )}

        {loadingInventory ? (
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] py-4 text-center">
            Cargando insumos disponibles...
          </p>
        ) : (
          <div className="space-y-3">
            {ingredients.length === 0 ? (
              <div className="py-6 px-4 text-center rounded-xl border border-dashed border-[var(--md-sys-color-outline-variant)] text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)]">
                No hay insumos vinculados todavía. Agrega los ingredientes y la cantidad requerida por cada porción.
              </div>
            ) : (
              ingredients.map((row, idx) => {
                const selectedInv = invById.get(String(row.insumoId));
                const unitMeasure =
                  selectedInv?.unitMeasure ||
                  selectedInv?.unit_measure ||
                  row.unitMeasure ||
                  "un.";
                const currentStock = Number(
                  selectedInv
                    ? selectedInv.currentStock ?? selectedInv.current_stock ?? 0
                    : row.currentStock ?? 0
                );
                const qtyNum = Number(row.cantidadRequerida);
                const rowPortions =
                  selectedInv && Number.isFinite(qtyNum) && qtyNum > 0
                    ? Math.floor((Math.max(0, currentStock) + 1e-9) / qtyNum)
                    : null;

                const optionsForRow = (inventoryItems || [])
                  .filter((item) => {
                    const itemIdStr = String(item.id);
                    const isCurrent = itemIdStr === String(row.insumoId);
                    const isTakenByOther = !isCurrent && selectedIds.has(itemIdStr);
                    const isActive = item.isActive ?? item.is_active ?? true;
                    return !isTakenByOther && (isActive || isCurrent);
                  })
                  .map((item) => {
                    const st = Number(item.currentStock ?? item.current_stock ?? 0);
                    const um = item.unitMeasure || item.unit_measure || "un.";
                    const inactiveFlag =
                      (item.isActive ?? item.is_active ?? true) === false
                        ? " [Inactivo]"
                        : "";
                    return {
                      value: String(item.id),
                      label: `${item.productName || item.item_name} (${st} ${um})${inactiveFlag}`,
                    };
                  });

                return (
                  <div
                    key={`${idx}-${row.insumoId || "empty"}`}
                    className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] grid grid-cols-1 sm:grid-cols-12 gap-3 items-start"
                  >
                    <div className="sm:col-span-6">
                      <Select
                        label={`Insumo #${idx + 1} *`}
                        name={`recipe-insumo-${idx}`}
                        value={String(row.insumoId || "")}
                        options={optionsForRow}
                        placeholder="Seleccione un insumo..."
                        size="md"
                        disabled={disabled}
                        className="!mb-0"
                        onChange={(e) =>
                          handleRowChange(idx, "insumoId", e.target.value)
                        }
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <Input
                        label={`Cantidad (${unitMeasure}) *`}
                        name={`recipe-qty-${idx}`}
                        size="md"
                        type="number"
                        min="0.001"
                        step="any"
                        placeholder="Ej: 0.4"
                        value={String(row.cantidadRequerida ?? "")}
                        disabled={disabled}
                        onChange={(e) =>
                          handleRowChange(idx, "cantidadRequerida", e.target.value)
                        }
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2 sm:pt-7">
                      {rowPortions !== null && (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium tabular-nums ${
                            rowPortions <= 0
                              ? "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
                              : "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]"
                          }`}
                        >
                          Rinde {rowPortions} un.
                        </span>
                      )}

                      <IconButton
                        type="button"
                        variant="standard"
                        hitSize={38}
                        iconSize={18}
                        disabled={disabled}
                        ariaLabel={`Eliminar insumo ${idx + 1}`}
                        title="Quitar insumo"
                        onClick={() => handleRemoveRow(idx)}
                      >
                        <M3Icon
                          name="delete"
                          size={18}
                          className="text-[var(--md-sys-color-error)]"
                        />
                      </IconButton>
                    </div>
                  </div>
                );
              })
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <Button
                type="button"
                variant="tonal"
                size="sm"
                leadingIcon="add"
                disabled={disabled || allInsumosUsed}
                onClick={handleAddRow}
              >
                Agregar insumo
              </Button>

              {error && (
                <span className="text-xs font-medium text-[var(--md-sys-color-error)]">
                  {error}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

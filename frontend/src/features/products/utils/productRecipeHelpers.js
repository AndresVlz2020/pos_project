/**
 * Calcula en tiempo real las porciones enteras disponibles según el insumo limitante.
 */
export function calculateRecipeAvailableStock(recipeRows = [], inventoryItems = []) {
  if (!Array.isArray(recipeRows) || recipeRows.length === 0) return 0;

  const invById = new Map(
    (inventoryItems || []).map((item) => [String(item.id), item])
  );

  let minPortions = Infinity;
  let hasValidIngredient = false;

  for (const row of recipeRows) {
    const insumoId = String(row?.insumoId ?? "").trim();
    const required = Number(row?.cantidadRequerida);
    if (!insumoId || !Number.isFinite(required) || required <= 0) continue;

    hasValidIngredient = true;
    const invItem = invById.get(insumoId);
    const currentStock = Number(
      invItem
        ? invItem.currentStock ?? invItem.current_stock ?? 0
        : row.currentStock ?? 0
    );
    const portions = Math.floor((Math.max(0, currentStock) + 1e-9) / required);
    if (portions < minPortions) minPortions = portions;
  }

  return hasValidIngredient && Number.isFinite(minPortions)
    ? Math.max(0, minPortions)
    : 0;
}

/**
 * Valida y normaliza las filas de la receta antes de enviar al API.
 */
export function validateRecipeRows(recipeRows = []) {
  if (!Array.isArray(recipeRows) || recipeRows.length === 0) {
    return {
      valid: false,
      error: "Agrega al menos un insumo del inventario para calcular el stock del platillo.",
      normalized: [],
    };
  }

  const seen = new Set();
  const normalized = [];

  for (let idx = 0; idx < recipeRows.length; idx += 1) {
    const row = recipeRows[idx];
    const insumoId = Number(row?.insumoId);
    const qty = Number(row?.cantidadRequerida);

    if (!Number.isInteger(insumoId) || insumoId <= 0) {
      return {
        valid: false,
        error: `Selecciona un insumo válido en la fila #${idx + 1} de la receta.`,
        normalized: [],
      };
    }
    if (seen.has(insumoId)) {
      return {
        valid: false,
        error: "No repitas el mismo insumo dentro de la receta.",
        normalized: [],
      };
    }
    seen.add(insumoId);

    if (!Number.isFinite(qty) || qty <= 0) {
      return {
        valid: false,
        error: `Ingresa una cantidad requerida mayor a 0 en la fila #${idx + 1}.`,
        normalized: [],
      };
    }

    normalized.push({
      insumoId,
      cantidadRequerida: Math.round(qty * 1000) / 1000,
    });
  }

  return { valid: true, error: "", normalized };
}

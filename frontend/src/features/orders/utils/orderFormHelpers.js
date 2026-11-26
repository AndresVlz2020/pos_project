export const PAYMENT_METHOD_VALUES = [
  "Efectivo",
  "Tarjeta débito",
  "Tarjeta crédito",
  "Transferencia",
  "Nequi",
  "Daviplata",
];

const VALID_PAYMENT_SET = new Set(PAYMENT_METHOD_VALUES);

export const ORDER_STATUS_FLOW = [
  "Creada",
  "Completada",
  "Entregada",
  "Pagada",
];

export const ORDER_STATUS_VALUES = [
  ...ORDER_STATUS_FLOW,
  "Anulada",
];

/**
 * Retorna el índice secuencial (0..3) dentro del flujo operativo de la orden,
 * o -1 si la orden está Anulada.
 */
export function getOrderStatusStepIndex(status) {
  return ORDER_STATUS_FLOW.indexOf(normalizeOrderStatus(status));
}

/**
 * Normaliza los distintos formatos de estado de una orden a los estados canónicos:
 * Creada -> Completada -> Entregada -> Pagada (+ Anulada).
 */
export function normalizeOrderStatus(raw) {
  const s = String(raw || "").trim().toLowerCase();
  if (s === "pagada" || s === "cerrada") return "Pagada";
  if (s === "entregada") return "Entregada";
  if (s === "completada" || s === "lista") return "Completada";
  if (s === "anulada") return "Anulada";
  return "Creada";
}

export function getOrderStatusBadgeMeta(status) {
  const normalized = normalizeOrderStatus(status);
  if (normalized === "Pagada") {
    return {
      label: "Pagada",
      icon: "check_circle",
      className:
        "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border border-[var(--md-sys-color-primary)]",
    };
  }
  if (normalized === "Entregada") {
    return {
      label: "Entregada",
      icon: "room_service",
      className:
        "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-primary)]/35",
    };
  }
  if (normalized === "Completada") {
    return {
      label: "Completada",
      icon: "task_alt",
      className:
        "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border border-[var(--md-sys-color-outline-variant)]",
    };
  }
  if (normalized === "Anulada") {
    return {
      label: "Anulada",
      icon: "block",
      className:
        "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border border-[var(--md-sys-color-error)]/40",
    };
  }
  return {
    label: "Creada",
    icon: "schedule",
    className:
      "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]",
  };
}

/**
 * Normaliza métodos heredados o escritos con distinta capitalización a uno de los 6 métodos válidos.
 */
export function normalizePaymentMethod(raw) {
  const val = String(raw || "").trim();
  if (VALID_PAYMENT_SET.has(val)) return val;

  const lower = val.toLowerCase();
  if (lower.includes("nequi/daviplata")) return "Nequi";
  if (lower.includes("daviplata")) return "Daviplata";
  if (lower.includes("nequi")) return "Nequi";
  if (lower.includes("débito") || lower.includes("debito")) return "Tarjeta débito";
  if (lower.includes("crédito") || lower.includes("credito")) return "Tarjeta crédito";
  if (lower.includes("transfer")) return "Transferencia";
  return "Efectivo";
}

/**
 * Extrae el número visible de mesa a partir de tableNumber (e.g. "Mesa 6" -> "6") o id.
 */
export function extractTableNumber(table) {
  const match = String(table?.tableNumber ?? "").match(/\d+/);
  return match ? match[0] : String(table?.id ?? "");
}

/**
 * Normaliza cadenas para búsqueda y comparación insensible a tildes/mayúsculas.
 */
export function normalizeFilterText(text = "") {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Mapea un producto del API a la forma uniforme usada en Crear/Editar Orden.
 */
export function mapProductToDish(p) {
  const ingredients = Array.isArray(p.ingredients)
    ? p.ingredients.map((ing) => ({
        insumoId: Number(ing.insumoId ?? ing.insumo_id),
        cantidadRequerida: Number(
          ing.cantidadRequerida ?? ing.cantidad_requerida ?? 0
        ),
        itemName: ing.itemName || ing.item_name || "",
        unitMeasure: ing.unitMeasure || ing.unit_measure || "un.",
        currentStock: Number(ing.currentStock ?? ing.current_stock ?? 0),
      }))
    : [];

  return {
    id: p.id,
    code: p.code,
    name: p.title || p.name,
    category: p.category || p.category_name || "general",
    price: Number(p.price) || 0,
    stock: Math.max(0, Math.floor(Number(p.stock) || 0)),
    stockMode: p.stockMode || (ingredients.length > 0 ? "recipe" : "direct"),
    hasRecipe: Boolean(p.hasRecipe || ingredients.length > 0),
    ingredients,
    status: p.is_active ? "Disponible" : "Inactivo",
    image: p.image || p.image_url,
  };
}

/**
 * Calcula el stock máximo disponible de un platillo dentro del carrito actual
 * teniendo en cuenta ingredientes compartidos con otros platillos seleccionados
 * y el compromiso previo en modo edición (initialQtyMap).
 */
export function computeDishDynamicMaxStock(
  dish,
  dishes = [],
  qtyMap = {},
  initialQtyMap = {}
) {
  if (!dish) return 0;

  if (!Array.isArray(dish.ingredients) || dish.ingredients.length === 0) {
    return (
      Math.max(0, Math.floor(Number(dish.stock ?? 0))) +
      Math.max(0, Math.floor(Number(initialQtyMap[dish.id] ?? 0)))
    );
  }

  let minPortions = Infinity;

  for (const targetIng of dish.ingredients) {
    const insumoId = Number(targetIng.insumoId);
    const reqForDish = Number(targetIng.cantidadRequerida);
    if (!insumoId || reqForDish <= 0) {
      minPortions = 0;
      break;
    }

    const baseInvStock = Math.max(0, Number(targetIng.currentStock ?? 0));
    let initialCommitted = 0;
    let selectedByOthers = 0;

    for (const d of dishes) {
      if (!Array.isArray(d.ingredients) || d.ingredients.length === 0) continue;
      const match = d.ingredients.find((ing) => Number(ing.insumoId) === insumoId);
      if (!match) continue;

      const req = Number(match.cantidadRequerida || 0);
      const initQ = Math.max(0, Math.floor(Number(initialQtyMap[d.id] ?? 0)));
      if (initQ > 0) {
        initialCommitted += initQ * req;
      }
      if (d.id !== dish.id) {
        const curQ = Math.max(0, Math.floor(Number(qtyMap[d.id] ?? 0)));
        if (curQ > 0) {
          selectedByOthers += curQ * req;
        }
      }
    }

    const remainingForDish = Math.max(
      0,
      baseInvStock + initialCommitted - selectedByOthers
    );
    const portions = Math.floor((remainingForDish + 1e-9) / reqForDish);
    if (portions < minPortions) minPortions = portions;
  }

  return Number.isFinite(minPortions) ? Math.max(0, minPortions) : 0;
}

/**
 * Filtra platillos por categoría y búsqueda, priorizando platillos fijados/seleccionados.
 */
export function filterDishesByQueryAndCategory(
  dishes = [],
  { search = "", category = "all", pinnedIds = new Set() } = {}
) {
  const q = normalizeFilterText(search);
  const cat = normalizeFilterText(category);

  const filtered = dishes.filter((d) => {
    const matchesCat =
      !cat || cat === "all" || normalizeFilterText(d.category) === cat;
    if (!matchesCat) return false;
    if (!q) return true;
    return (
      normalizeFilterText(d.name).includes(q) ||
      normalizeFilterText(d.code).includes(q) ||
      normalizeFilterText(d.category).includes(q)
    );
  });

  if (!pinnedIds || pinnedIds.size === 0) return filtered;
  return [...filtered].sort((a, b) => {
    const aPinned = pinnedIds.has(String(a.id)) ? 1 : 0;
    const bPinned = pinnedIds.has(String(b.id)) ? 1 : 0;
    return bPinned - aPinned;
  });
}

/**
 * Normaliza estados de órdenes y calcula contadores por estado para barras de filtro.
 */
export function summarizeOrderStatuses(orders = []) {
  const normalizedOrders = (orders || []).map((o) => {
    const canonical = normalizeOrderStatus(o.status);
    return { ...o, status: canonical, orderStatus: canonical };
  });

  const counts = {
    all: normalizedOrders.length,
    Creada: 0,
    Completada: 0,
    Entregada: 0,
    Pagada: 0,
    Anulada: 0,
  };

  normalizedOrders.forEach((o) => {
    if (counts[o.status] !== undefined) counts[o.status] += 1;
  });

  return { normalizedOrders, counts };
}

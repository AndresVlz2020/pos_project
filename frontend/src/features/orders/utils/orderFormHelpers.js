export const PAYMENT_METHOD_VALUES = [
  "Efectivo",
  "Tarjeta débito",
  "Tarjeta crédito",
  "Transferencia",
  "Nequi",
  "Daviplata",
];

const VALID_PAYMENT_SET = new Set(PAYMENT_METHOD_VALUES);

export const ORDER_STATUS_VALUES = [
  "Creada",
  "Completada",
  "Entregada",
  "Pagada",
  "Anulada",
];

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
        "bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)]",
    };
  }
  if (normalized === "Entregada") {
    return {
      label: "Entregada",
      icon: "room_service",
      className:
        "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border border-[var(--md-sys-color-secondary)]/40",
    };
  }
  if (normalized === "Completada") {
    return {
      label: "Completada",
      icon: "task_alt",
      className:
        "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-primary)]/40",
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
      "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning-border)]",
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
  return {
    id: p.id,
    code: p.code,
    name: p.title || p.name,
    category: p.category || p.category_name || "general",
    price: Number(p.price) || 0,
    stock: Math.max(0, Math.floor(Number(p.stock) || 0)),
    status: p.is_active ? "Disponible" : "Inactivo",
    image: p.image || p.image_url,
  };
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

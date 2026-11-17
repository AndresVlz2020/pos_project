import { getStoredAuthUser } from "@/shared/utils/authStorage";

const DRAFT_KEY_PREFIX = "dpiero_order_draft_";
const HANDOFF_KEY_PREFIX = "dpiero_order_handoff_";
const LEGACY_PENDING_KEY_PREFIX = "dpiero_order_pending_";

function getSessionStorage() {
  try {
    if (typeof globalThis !== "undefined" && globalThis.sessionStorage) {
      return globalThis.sessionStorage;
    }
  } catch {
    return null;
  }
  return null;
}

function getUserKey() {
  const user = getStoredAuthUser();
  const id = user?.id ?? user?.userId ?? user?.email;
  return id ? String(id) : "guest";
}

function getDraftKey() {
  return `${DRAFT_KEY_PREFIX}${getUserKey()}`;
}

function getHandoffKey() {
  return `${HANDOFF_KEY_PREFIX}${getUserKey()}`;
}

function removeKeysByPrefixes(prefixes) {
  const sStore = getSessionStorage();
  if (!sStore) return;
  try {
    const keysToDelete = [];
    for (let i = 0; i < sStore.length; i += 1) {
      const key = sStore.key(i);
      if (key && prefixes.some((prefix) => key.startsWith(prefix))) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => sStore.removeItem(key));
  } catch {
    // Ignorar errores de almacenamiento
  }
}

export function readOrderDraft() {
  const sStore = getSessionStorage();
  if (!sStore) {
    return { qty: {}, tableNumber: "", observations: "", pinnedIds: [] };
  }
  try {
    const raw = sStore.getItem(getDraftKey());
    if (!raw) return { qty: {}, tableNumber: "", observations: "", pinnedIds: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { qty: {}, tableNumber: "", observations: "", pinnedIds: [] };
    }

    const cleanQty = {};
    if (parsed.qty && typeof parsed.qty === "object") {
      Object.entries(parsed.qty).forEach(([k, v]) => {
        const count = Math.trunc(Number(v) || 0);
        if (count > 0) cleanQty[String(k)] = count;
      });
    }

    return {
      qty: cleanQty,
      tableNumber: typeof parsed.tableNumber === "string" ? parsed.tableNumber : "",
      observations: typeof parsed.observations === "string" ? parsed.observations : "",
      pinnedIds: Array.isArray(parsed.pinnedIds) ? parsed.pinnedIds.map(String) : [],
    };
  } catch {
    return { qty: {}, tableNumber: "", observations: "", pinnedIds: [] };
  }
}

export function saveOrderDraft({
  qty = {},
  tableNumber = "",
  observations = "",
  pinnedIds = [],
} = {}) {
  const sStore = getSessionStorage();
  if (!sStore) return;
  try {
    const cleanQty = {};
    Object.entries(qty).forEach(([k, v]) => {
      const count = Math.trunc(Number(v) || 0);
      if (count > 0) cleanQty[String(k)] = count;
    });

    const payload = {
      qty: cleanQty,
      tableNumber: String(tableNumber || ""),
      observations: String(observations || ""),
      pinnedIds: Array.from(pinnedIds || []).map(String),
    };
    sStore.setItem(getDraftKey(), JSON.stringify(payload));
  } catch {
    // Ignorar errores de almacenamiento
  }
}

/**
 * Registra la selección de un producto desde Inicio en sessionStorage
 * preservando cualquier borrador activo en /CreateOrder.
 */
export function startOrderWithProduct(product, quantity = 1) {
  if (!product) return null;
  const sStore = getSessionStorage();
  if (!sStore) return null;

  const stockLimit =
    product.stock !== undefined && product.stock !== null
      ? Math.max(0, Math.floor(Number(product.stock)))
      : null;

  const requestedQty = Math.max(1, Math.trunc(Number(quantity) || 1));
  const normalizedQty =
    stockLimit !== null ? Math.min(requestedQty, Math.max(1, stockLimit)) : requestedQty;

  const payload = {
    id: product.id ?? null,
    code: product.code ? String(product.code) : "",
    title: product.title || product.name ? String(product.title || product.name) : "",
    quantity: normalizedQty,
  };

  try {
    const numericId = Number(product.id);
    if (Number.isInteger(numericId) && numericId > 0) {
      sStore.removeItem(getHandoffKey());
      const idStr = String(numericId);
      const draft = readOrderDraft();
      const prevQty = draft.qty[idStr] || 0;
      const mergedQty =
        stockLimit !== null
          ? Math.min(prevQty + normalizedQty, stockLimit)
          : prevQty + normalizedQty;

      saveOrderDraft({
        ...draft,
        qty: {
          ...draft.qty,
          ...(mergedQty > 0 ? { [idStr]: mergedQty } : {}),
        },
        pinnedIds: Array.from(new Set([...(draft.pinnedIds || []), idStr])),
      });
    } else {
      sStore.setItem(getHandoffKey(), JSON.stringify(payload));
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Lee de forma síncrona el estado inicial combinado (borrador en sessionStorage + transferencia desde Inicio).
 */
export function readInitialHandoffQty() {
  const draft = readOrderDraft();
  const sStore = getSessionStorage();
  if (!sStore) return draft.qty;

  try {
    const raw = sStore.getItem(getHandoffKey());
    if (!raw) return draft.qty;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return draft.qty;

    const numericId = Number(parsed.id);
    if (Number.isInteger(numericId) && numericId > 0) {
      const idStr = String(numericId);
      if (draft.qty[idStr]) {
        return draft.qty;
      }
      const qty = Math.max(1, Math.trunc(Number(parsed.quantity) || 1));
      return { ...draft.qty, [idStr]: qty };
    }
    return draft.qty;
  } catch {
    return draft.qty;
  }
}

/**
 * Concilia la transferencia pendiente de Inicio contra el catálogo real de PostgreSQL,
 * resolviendo productos por código/título y acotando al stock disponible.
 */
export function consumeOrderHandoff(products = []) {
  const sStore = getSessionStorage();
  if (!sStore) return null;

  const key = getHandoffKey();
  try {
    const raw = sStore.getItem(key);
    if (!raw) return null;
    sStore.removeItem(key);

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const quantity = Math.max(1, Math.trunc(Number(parsed.quantity) || 1));
    const numericId = Number(parsed.id);
    const catalog = Array.isArray(products) ? products : [];

    const isEligible = (p) =>
      p &&
      p.is_active !== false &&
      p.isActive !== false &&
      p.status !== "Inactivo" &&
      p.status !== "Inhabilitado" &&
      Math.floor(Number(p.stock || 0)) > 0;

    let match = null;
    if (Number.isInteger(numericId) && numericId > 0) {
      match = catalog.find((p) => String(p.id) === String(numericId)) || null;
      if (match && !isEligible(match)) {
        return { removeInvalidId: String(numericId) };
      }
    }

    if (!match) {
      const codeNorm = String(parsed.code || "").trim().toUpperCase();
      const titleNorm = String(parsed.title || "").trim().toLowerCase();
      match =
        catalog.find((p) => {
          if (!isEligible(p)) return false;
          if (codeNorm && String(p.code || "").trim().toUpperCase() === codeNorm) {
            return true;
          }
          if (titleNorm && String(p.title || p.name || "").trim().toLowerCase() === titleNorm) {
            return true;
          }
          return false;
        }) || null;
    }

    if (match?.id && isEligible(match)) {
      const available = Math.max(1, Math.floor(Number(match.stock || 0)));
      const clampedQty = Math.min(quantity, available);
      return {
        resolvedQty: { [String(match.id)]: clampedQty },
        resolvedId: String(match.id),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearOrderDraft() {
  const sStore = getSessionStorage();
  if (!sStore) return;
  const userKey = getUserKey();
  try {
    sStore.removeItem(`${HANDOFF_KEY_PREFIX}${userKey}`);
    sStore.removeItem(`${DRAFT_KEY_PREFIX}${userKey}`);
    sStore.removeItem(`${LEGACY_PENDING_KEY_PREFIX}${userKey}`);
  } catch {
    // Ignorar errores de almacenamiento
  }
}

export function clearAllOrderDrafts() {
  removeKeysByPrefixes([
    HANDOFF_KEY_PREFIX,
    DRAFT_KEY_PREFIX,
    LEGACY_PENDING_KEY_PREFIX,
  ]);
}

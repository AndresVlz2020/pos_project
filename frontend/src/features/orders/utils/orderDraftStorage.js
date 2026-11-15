const DRAFT_KEY_PREFIX = "dpiero_order_draft_";
const HANDOFF_KEY_PREFIX = "dpiero_order_handoff_";
const LEGACY_PENDING_KEY_PREFIX = "dpiero_order_pending_";

function getStorage(type) {
  try {
    if (typeof globalThis !== "undefined" && globalThis[type]) {
      return globalThis[type];
    }
  } catch {
    return null;
  }
  return null;
}

function getUserKey() {
  const sStore = getStorage("sessionStorage");
  const lStore = getStorage("localStorage");
  try {
    const raw = sStore?.getItem("user") || lStore?.getItem("auth_user");
    if (!raw) return "guest";
    const parsed = JSON.parse(raw);
    const id = parsed?.id ?? parsed?.userId ?? parsed?.email;
    return id ? String(id) : "guest";
  } catch {
    return "guest";
  }
}

function getHandoffKey() {
  return `${HANDOFF_KEY_PREFIX}${getUserKey()}`;
}

function removeKeysByPrefixes(prefixes) {
  const sStore = getStorage("sessionStorage");
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

/**
 * Guarda una transferencia de un solo uso para iniciar /CreateOrder con un platillo elegido desde Inicio.
 * Siempre limpia cualquier transferencia o borrador previo para no arrastrar selecciones no registradas.
 */
export function startOrderWithProduct(product, quantity = 1) {
  if (!product) return null;
  const sStore = getStorage("sessionStorage");
  if (!sStore) return null;

  clearOrderDraft();

  const normalizedQty = Math.max(1, Math.trunc(Number(quantity) || 1));
  const payload = {
    id: product.id ?? null,
    code: product.code ? String(product.code) : "",
    title: product.title ? String(product.title) : "",
    quantity: normalizedQty,
  };

  try {
    sStore.setItem(getHandoffKey(), JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Lee de forma síncrona el platillo inicial enviado desde Inicio sin borrarlo aún,
 * manteniendo compatibilidad con React StrictMode en el montaje inicial de /CreateOrder.
 */
export function readInitialHandoffQty() {
  const sStore = getStorage("sessionStorage");
  if (!sStore) return {};
  try {
    const raw = sStore.getItem(getHandoffKey());
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    const qty = Math.max(1, Math.trunc(Number(parsed.quantity) || 1));
    const numericId = Number(parsed.id);
    if (Number.isInteger(numericId) && numericId > 0) {
      return { [String(numericId)]: qty };
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Consume (elimina) la transferencia de un solo uso una vez cargado el catálogo de /CreateOrder.
 * Si el ID numérico quedó deshabilitado en BD, indica retirarlo; si vino con ID estático/código, lo resuelve.
 */
export function consumeOrderHandoff(products = []) {
  const sStore = getStorage("sessionStorage");
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
    const activeProducts = Array.isArray(products)
      ? products.filter((p) => p && p.isActive !== false && p.status !== "Inhabilitado")
      : [];

    if (Number.isInteger(numericId) && numericId > 0) {
      const idStr = String(numericId);
      const existsAsActive = activeProducts.some((p) => String(p.id) === idStr);
      if (!existsAsActive && Array.isArray(products) && products.length > 0) {
        return { removeInvalidId: idStr };
      }
      return null;
    }

    const codeNorm = String(parsed.code || "").trim().toUpperCase();
    const titleNorm = String(parsed.title || "").trim().toLowerCase();
    const match = activeProducts.find((p) => {
      if (codeNorm && String(p.code || "").trim().toUpperCase() === codeNorm) {
        return true;
      }
      if (titleNorm && String(p.title || "").trim().toLowerCase() === titleNorm) {
        return true;
      }
      return false;
    });

    if (match?.id) {
      return { resolvedQty: { [String(match.id)]: quantity } };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearOrderDraft() {
  const sStore = getStorage("sessionStorage");
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

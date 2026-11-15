export const PAYMENT_METHOD_VALUES = [
  "Efectivo",
  "Tarjeta débito",
  "Tarjeta crédito",
  "Transferencia",
  "Nequi",
  "Daviplata",
];

const VALID_PAYMENT_SET = new Set(PAYMENT_METHOD_VALUES);

/**
 * Normaliza los distintos formatos de estado de una orden a los estados canónicos.
 */
export function normalizeOrderStatus(raw) {
  const s = String(raw || "").trim().toLowerCase();
  if (s === "pagada") return "Pagada";
  if (s === "anulada") return "Anulada";
  return "No Pagada";
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

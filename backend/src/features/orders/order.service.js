import { orderRepository } from "./order.repository.js";

// Ciclo de vida de la orden (tres estados finales).
//   * "No Pagada" -> la mesa permanece ocupada
//   * "Pagada"    -> la mesa queda libre
//   * "Anulada"   -> la mesa queda libre (stock restaurado)
const VALID_STATUSES = ["Pagada", "No Pagada", "Anulada"];

// Normaliza el texto a los tres estados conocidos.
export function normalizeStatus(input) {
  const raw = String(input ?? "").trim().toLowerCase();
  if (raw === "pagada") return "Pagada";
  if (raw === "no pagada") return "No Pagada";
  if (raw === "anulada") return "Anulada";
  throw new Error(
    `Estado inválido: "${input}". Solo se permiten "Pagada", "No Pagada" y "Anulada".`
  );
}

export const orderService = {
  async getAllOrders(filters) {
    return await orderRepository.findAll(filters);
  },

  async getOrderById(id) {
    const order = await orderRepository.findById(id);
    if (!order) throw new Error("Orden no encontrada");
    return order;
  },

  async createOrder(data) {
    if (!data.tableNumber && !data.table) {
      throw new Error("El número de mesa es obligatorio para registrar la comanda");
    }

    if (data.status !== undefined || data.orderStatus !== undefined) {
      data.status = normalizeStatus(data.status ?? data.orderStatus);
    } else {
      data.status = "No Pagada"; // Estado por defecto: cuenta sin pagar (mesa ocupada)
    }

    return await orderRepository.create(data);
  },

  async updateOrder(id, data) {
    // Normalizar estado si viene en el payload
    if (data.status !== undefined || data.orderStatus !== undefined) {
      data.status = normalizeStatus(data.status ?? data.orderStatus);
    }

    const updated = await orderRepository.update(id, data);
    if (!updated) throw new Error("Orden no encontrada para actualizar");
    return updated;
  },

  async updateOrderStatus(id, status) {
    const normalized = normalizeStatus(status);
    const updated = await orderRepository.updateStatus(id, normalized);
    if (!updated) throw new Error("Orden no encontrada para actualizar estado");
    return updated;
  },

  // Anular = marcar la orden como Anulada y restaurar stock (misma operación de siempre).
  async cancelOrder(id, reason = "") {
    return this.updateOrderStatus(id, "Anulada");
  },

  async getTablesAvailability() {
    return await orderRepository.getTablesAvailability();
  },
};

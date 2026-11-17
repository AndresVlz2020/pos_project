import { orderRepository } from "./order.repository.js";
import { notificationService } from "../notifications/notification.service.js";

// Ciclo de vida de la orden:
//   * "Creada"     -> Recién registrada por el mesero/POS (en espera de Cocina; mesa ocupada)
//   * "Completada" -> Terminada por Cocina (notifica al Mesero para recoger y entregar)
//   * "Entregada"  -> Servida en mesa por el Mesero (en espera de cobro por Cajero; mesa ocupada)
//   * "Pagada"     -> Cobrada por Cajero / Admin (cierra la cuenta y libera mesa)
//   * "Anulada"    -> Cancelada (libera mesa y restaura stock)
const VALID_STATUSES = ["Creada", "Completada", "Entregada", "Pagada", "Anulada"];

export class OrderServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export function normalizeStatus(input) {
  const raw = String(input ?? "").trim().toLowerCase();
  if (raw === "creada") return "Creada";
  if (raw === "completada") return "Completada";
  if (raw === "entregada") return "Entregada";
  if (raw === "pagada") return "Pagada";
  if (raw === "anulada") return "Anulada";
  throw new OrderServiceError(
    `Estado inválido: "${input}". Solo se permiten "Creada", "Completada", "Entregada", "Pagada" y "Anulada".`,
    400
  );
}

function getActorRoles(authenticatedUser) {
  const role = String(authenticatedUser?.role || "").trim().toLowerCase();
  const isAdmin = Boolean(
    authenticatedUser?.isAdmin ||
      authenticatedUser?.isSuperuser ||
      role === "admin" ||
      role === "administrador"
  );
  const isWaiter = !isAdmin && (role === "mesero" || role === "salon");
  const isKitchen =
    !isAdmin &&
    (role === "cocina" || role === "cocinero" || role === "parrilla");
  const isCashier = !isAdmin && (role === "cajero" || role === "caja");
  return { isAdmin, isWaiter, isKitchen, isCashier };
}

function assertStatusTransitionAllowed({
  currentStatus,
  nextStatus,
  authenticatedUser,
}) {
  if (currentStatus === "Pagada" || currentStatus === "Anulada") {
    throw new OrderServiceError(
      `La orden ya se encuentra "${currentStatus}" y no admite modificaciones.`,
      400
    );
  }

  const { isAdmin, isWaiter, isKitchen } = getActorRoles(authenticatedUser);
  if (isAdmin) return;

  if (nextStatus === "Pagada" && (isWaiter || isKitchen)) {
    throw new OrderServiceError(
      "El mesero y el cocinero no pueden marcar órdenes como Pagada. Solo Cajero o Administrador.",
      403
    );
  }

  if (
    nextStatus === "Completada" &&
    currentStatus !== "Completada" &&
    isWaiter
  ) {
    throw new OrderServiceError(
      "Solo Cocina o Administrador puede marcar la orden como Completada.",
      403
    );
  }

  if (
    nextStatus === "Entregada" &&
    currentStatus !== "Entregada"
  ) {
    if (isKitchen) {
      throw new OrderServiceError(
        "Solo Mesero, Cajero o Administrador puede marcar la orden como Entregada.",
        403
      );
    }
    if (currentStatus !== "Completada") {
      throw new OrderServiceError(
        "La orden debe estar en estado Completada por Cocina antes de marcarse como Entregada.",
        400
      );
    }
  }
}

export const orderService = {
  async getAllOrders(filters) {
    return await orderRepository.findAll(filters);
  },

  async getOrderById(id) {
    const order = await orderRepository.findById(id);
    if (!order) throw new OrderServiceError("Orden no encontrada", 404);
    return order;
  },

  async createOrder(data, authenticatedUser = null) {
    if (!data.tableNumber && !data.table) {
      throw new OrderServiceError(
        "El número de mesa es obligatorio para registrar la orden",
        400
      );
    }

    const orderData = { ...data };
    if (authenticatedUser?.id) {
      orderData.waiterId = authenticatedUser.id;
    }

    // Toda orden creada desde el flujo operativo inicia automáticamente en estado "Creada".
    const { isAdmin } = getActorRoles(authenticatedUser);
    if (
      isAdmin &&
      (orderData.status !== undefined || orderData.orderStatus !== undefined)
    ) {
      orderData.status = normalizeStatus(
        orderData.status ?? orderData.orderStatus
      );
    } else {
      orderData.status = "Creada";
    }

    return await orderRepository.create(orderData);
  },

  async updateOrder(id, data, authenticatedUser = null) {
    const existing = await orderRepository.findById(id);
    if (!existing) {
      throw new OrderServiceError("Orden no encontrada para actualizar", 404);
    }

    const payload = { ...data };
    if (data.status !== undefined || data.orderStatus !== undefined) {
      const nextStatus = normalizeStatus(data.status ?? data.orderStatus);
      assertStatusTransitionAllowed({
        currentStatus: existing.status,
        nextStatus,
        authenticatedUser,
      });
      payload.status = nextStatus;
    } else if (existing.status === "Pagada" || existing.status === "Anulada") {
      throw new OrderServiceError(
        `La orden ya se encuentra "${existing.status}" y no admite modificaciones.`,
        400
      );
    }

    if (authenticatedUser?.id) {
      payload.waiterId = authenticatedUser.id;
    }

    const updated = await orderRepository.update(id, payload);
    if (!updated) {
      throw new OrderServiceError("Orden no encontrada para actualizar", 404);
    }

    if (
      existing.status !== "Completada" &&
      updated.status === "Completada"
    ) {
      await notificationService
        .createOrderCompletedNotification(updated, authenticatedUser)
        .catch((err) =>
          console.warn("No se pudo registrar notificación de orden completada:", err)
        );
    }

    return updated;
  },

  async updateOrderStatus(id, status, authenticatedUser = null) {
    const existing = await orderRepository.findById(id);
    if (!existing) {
      throw new OrderServiceError(
        "Orden no encontrada para actualizar estado",
        404
      );
    }

    const normalized = normalizeStatus(status);
    assertStatusTransitionAllowed({
      currentStatus: existing.status,
      nextStatus: normalized,
      authenticatedUser,
    });

    const updated = await orderRepository.updateStatus(
      id,
      normalized,
      authenticatedUser?.id || null
    );
    if (!updated) {
      throw new OrderServiceError(
        "Orden no encontrada para actualizar estado",
        404
      );
    }

    if (
      existing.status !== "Completada" &&
      updated.status === "Completada"
    ) {
      await notificationService
        .createOrderCompletedNotification(updated, authenticatedUser)
        .catch((err) =>
          console.warn("No se pudo registrar notificación de orden completada:", err)
        );
    }

    return updated;
  },

  async cancelOrder(id) {
    const updated = await orderRepository.updateStatus(id, "Anulada", null);
    if (!updated) {
      throw new OrderServiceError("Orden no encontrada para anular", 404);
    }
    return updated;
  },

  async getTablesAvailability() {
    return await orderRepository.getTablesAvailability();
  },
};

export { VALID_STATUSES };

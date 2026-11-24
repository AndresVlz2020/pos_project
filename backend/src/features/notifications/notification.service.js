import { notificationRepository } from "./notification.repository.js";

function resolveNotificationScope(user) {
  const role = String(user?.role || "").trim().toLowerCase();
  const isAdmin = Boolean(
    user?.isAdmin ||
      user?.isSuperuser ||
      role === "admin" ||
      role === "administrador"
  );
  const isMesero = !isAdmin && (role === "mesero" || role === "salon");
  return { isAdmin, isMesero };
}

function buildItemsSummary(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "";
  const preview = items
    .slice(0, 3)
    .map((it) => `${Math.max(1, Number(it.qty || it.quantity || 1))}x ${it.name || "Platillo"}`)
    .join(", ");
  return items.length > 3 ? `${preview} y ${items.length - 3} más` : preview;
}

export const notificationService = {
  async createOrderCompletedNotification(order, actorUser = null) {
    if (!order) return null;

    const orderNumber = order.order_number || order.idCode || String(order.id);
    const tableNumber = order.tableNumber || order.table_number || "Mesa";
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsSummary = buildItemsSummary(items);

    const title = `Orden ${orderNumber} lista en Cocina`;
    const message = itemsSummary
      ? `${tableNumber} · ${itemsSummary} — Lista para entregar en mesa.`
      : `${tableNumber} · Preparada en Cocina y lista para entregar en mesa.`;

    return await notificationRepository.create({
      type: "order_completed",
      title,
      message,
      orderId: Number(order.numericId || order.id) || null,
      orderNumber: String(orderNumber),
      tableNumber: String(tableNumber),
      targetRole: "Mesero",
      targetUserId: Number(order.waiter_id) || null,
      createdByUserId: Number(actorUser?.id) || null,
      metadata: {
        waiterName: order.waiter || "",
        actorName: actorUser?.name || "",
        itemsCount: items.length,
        itemsSummary,
      },
    });
  },

  async listForUser(authenticatedUser) {
    const userId = Number(authenticatedUser?.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return { notifications: [], unreadCount: 0 };
    }

    const { isAdmin, isMesero } = resolveNotificationScope(authenticatedUser);
    if (!isAdmin && !isMesero) {
      return { notifications: [], unreadCount: 0 };
    }

    return await notificationRepository.findForUser({
      userId,
      targetRole: "Mesero",
      includeAllRoles: isAdmin,
    });
  },

  async markAsRead(notificationId, authenticatedUser) {
    const userId = Number(authenticatedUser?.id);
    const { isAdmin, isMesero } = resolveNotificationScope(authenticatedUser);
    if (!Number.isInteger(userId) || (!isAdmin && !isMesero)) {
      const err = new Error("No autorizado para actualizar esta notificación.");
      err.status = 403;
      throw err;
    }

    const res = await notificationRepository.markAsRead(notificationId, userId);
    if (!res) {
      const err = new Error("Notificación no encontrada.");
      err.status = 404;
      throw err;
    }
    return res;
  },

  async markAllAsRead(authenticatedUser) {
    const userId = Number(authenticatedUser?.id);
    const { isAdmin, isMesero } = resolveNotificationScope(authenticatedUser);
    if (!Number.isInteger(userId) || (!isAdmin && !isMesero)) {
      const err = new Error("No autorizado para actualizar notificaciones.");
      err.status = 403;
      throw err;
    }

    return await notificationRepository.markAllAsRead({
      userId,
      targetRole: "Mesero",
      includeAllRoles: isAdmin,
    });
  },

  async markResolvedByOrder(orderIdentifier) {
    if (!orderIdentifier) return 0;
    return await notificationRepository.markResolvedByOrder(orderIdentifier);
  },
};

import { API_URL } from "@/features/config";
import { getAuthHeaders } from "@/shared/utils/authStorage";

const NOTIFICATIONS_URL = `${API_URL}/notifications`;

export async function getNotifications() {
  const response = await fetch(NOTIFICATIONS_URL, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Error al obtener notificaciones");
  }

  return await response.json();
}

export async function markNotificationAsRead(notificationId) {
  const response = await fetch(`${NOTIFICATIONS_URL}/${notificationId}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Error al marcar notificación como leída");
  }

  return await response.json();
}

export async function markAllNotificationsAsRead() {
  const response = await fetch(`${NOTIFICATIONS_URL}/read-all`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Error al marcar notificaciones como leídas");
  }

  return await response.json();
}

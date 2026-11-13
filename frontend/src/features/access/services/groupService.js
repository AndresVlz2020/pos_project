// frontend/src/features/access/services/groupService.js
import { API_URL } from "@/features/config";
import { getAdminStepUpHeaders } from "@/shared/services/adminStepUpService";

const GROUPS_API_URL = `${API_URL}/groups`;

function getStoredToken() {
  return (
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

function getAuthHeaders() {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getGroups() {
  const response = await fetch(GROUPS_API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error obteniendo grupos");
  }

  return response.json();
}

// función para actualizar permisos de un grupo
export async function updateGroupPermissions(groupId, permissionIds) {
  const token = getStoredToken();
  const stepUpHeaders = await getAdminStepUpHeaders("Confirmar cambio de permisos de rol");

  const response = await fetch(`${GROUPS_API_URL}/${groupId}/permissions`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...stepUpHeaders,
    },
    body: JSON.stringify({
      permissionIds,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || "Error actualizando permisos del grupo");
  }

  return response.json();
}

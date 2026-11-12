// frontend/src/features/access/services/groupService.js
import { API_URL } from "@/features/config";

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

  const response = await fetch(`${GROUPS_API_URL}/${groupId}/permissions`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      permissionIds,
    }),
  });

  if (!response.ok) {
    throw new Error("Error actualizando permisos del grupo");
  }

  return response.json();
}

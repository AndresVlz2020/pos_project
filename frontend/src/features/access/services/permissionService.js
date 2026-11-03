// frontend/src/features/access/services/permissionService.js

const API_URL = "http://localhost:4000/api/groups";
const USERS_API_URL = "http://localhost:4000/api/users";
const PERMISSIONS_API_URL = "http://localhost:4000/api/permissions";

function getStoredToken() {
  return (
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

export async function getGroupPermissions(groupId) {
  const response = await fetch(`${API_URL}/${groupId}/permissions`);

  if (!response.ok) {
    throw new Error("Error obteniendo permisos");
  }

  return response.json();
}

export async function getUserPermissions(userId) {
  const response = await fetch(`${USERS_API_URL}/${userId}/permissions`);

  if (!response.ok) {
    throw new Error("Error obteniendo permisos del usuario");
  }

  return response.json();
}

export async function updateUserPermissions(userId, permissionIds) {
  const token = getStoredToken();

  const response = await fetch(`${USERS_API_URL}/${userId}/permissions`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      permissionIds,
    }),
  });

  if (!response.ok) {
    throw new Error("Error actualizando permisos del usuario");
  }

  return response.json();
}

export async function getAllPermissions() {
  const response = await fetch(PERMISSIONS_API_URL);

  if (!response.ok) {
    throw new Error("Error obteniendo permisos");
  }

  return response.json();
}

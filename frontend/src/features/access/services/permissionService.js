// frontend/src/features/access/services/permissionService.js
import { API_URL } from "@/features/config";

const GROUPS_API_URL = `${API_URL}/groups`;
const USERS_API_URL = `${API_URL}/users`;
const PERMISSIONS_API_URL = `${API_URL}/permissions`;

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

export async function getGroupPermissions(groupId) {
  const response = await fetch(`${GROUPS_API_URL}/${groupId}/permissions`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error obteniendo permisos");
  }

  return response.json();
}

export async function getUserPermissions(userId) {
  const response = await fetch(`${USERS_API_URL}/${userId}/permissions`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error obteniendo permisos del usuario");
  }

  return response.json();
}

export async function updateUserPermissions(userId, permissionIds) {
  const response = await fetch(`${USERS_API_URL}/${userId}/permissions`, {
    method: "PUT",
    headers: getAuthHeaders(),
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
  const response = await fetch(PERMISSIONS_API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error obteniendo permisos");
  }

  return response.json();
}

// frontend/src/features/access/services/groupService.js

const API_URL = "http://localhost:4000/api/groups";

function getStoredToken() {
  return (
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

export async function getGroups() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Error obteniendo grupos");
  }

  return response.json();
}

// función para actualizar permisos de un grupo
export async function updateGroupPermissions(groupId, permissionIds) {
  const token = getStoredToken();

  const response = await fetch(`${API_URL}/${groupId}/permissions`, {
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
    throw new Error("Error actualizando permisos del grupo");
  }

  return response.json();
}

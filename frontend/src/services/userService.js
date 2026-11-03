// Servicio de comunicación con la API Backend de usuarios
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function getStoredToken() {
  return (
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

/**
 * Crea un nuevo usuario enviando la información al backend
 * @param {Object} userData - Datos validados del usuario
 * @returns {Promise<Object>} Respuesta del backend
 */
export async function createUser(userData) {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || data.error || `Error en el servidor (${response.status})`);
    }

    return data;
  } catch (err) {
    if (err.name === "TypeError" || err.message?.includes("fetch") || err.message?.includes("NetworkError")) {
      throw new Error("Error inesperado de conexión con el servidor backend.");
    }
    throw err;
  }
}

/**
 * Obtiene la lista de usuarios desde el backend
 * @param {Object} [options] - { activeOnly: boolean }
 * @returns {Promise<Array>} Lista de usuarios
 */
export async function getUsers({ activeOnly = false } = {}) {
  try {
    const url = activeOnly
      ? `${API_BASE_URL}/users?active=true`
      : `${API_BASE_URL}/users`;
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || data.error || `Error al obtener usuarios (${response.status})`);
    }

    return Array.isArray(data) ? data : data.data || [];
  } catch (err) {
    if (err.name === "TypeError" || err.message?.includes("fetch") || err.message?.includes("NetworkError")) {
      throw new Error("Error inesperado de conexión con el servidor backend.");
    }
    throw err;
  }
}

/**
 * Actualiza el estado activo/inactivo de un usuario en PostgreSQL en tiempo real
 * @param {number|string} userId
 * @param {boolean} isActive
 */
export async function updateUserStatus(userId, isActive) {
  const token = getStoredToken();

  const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ isActive }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || "Error al actualizar el estado del usuario");
  }

  return data;
}

/**
 * Actualiza un usuario existente en el backend
 * @param {number|string} id - ID del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<Object>} Respuesta del backend
 */
export async function updateUser(id, userData) {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || data.error || `Error al actualizar usuario (${response.status})`);
    }

    return data.data || data;
  } catch (err) {
    if (err.name === "TypeError" || err.message?.includes("fetch") || err.message?.includes("NetworkError")) {
      throw new Error("Error inesperado de conexión con el servidor backend.");
    }
    throw err;
  }
}

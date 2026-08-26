// Servicio de comunicación con la API Backend de usuarios
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/**
 * Crea un nuevo usuario enviando la información al backend
 * @param {Object} userData - Datos validados del usuario
 * @returns {Promise<Object>} Respuesta del backend
 */
export async function createUser(userData) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Error en el servidor (${response.status})`);
  }

  return data;
}

/**
 * Obtiene la lista de usuarios desde el backend
 * @returns {Promise<Array>} Lista de usuarios
 */
export async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Error al obtener usuarios (${response.status})`);
  }

  return data.data || data;
}

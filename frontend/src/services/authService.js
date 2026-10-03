// frontend/src/services/authService.js
// Servicio de comunicación con la API Backend de autenticación JWT

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/**
 * Autentica un usuario contra el backend con email y password
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} { message, token, user }
 */
export async function loginApi({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Error al iniciar sesión (${response.status})`);
  }

  return data;
}

/**
 * Solicita el restablecimiento de contraseña para un correo
 * @param {string} email
 * @returns {Promise<Object>} { message, resetToken, resetUrl }
 */
export async function forgotPasswordApi(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Error al procesar la solicitud");
    }

    return data;
  } catch (err) {
    if (err.name === "TypeError" || err.message?.includes("fetch")) {
      throw new Error("Error inesperado de conexión con el servidor backend.");
    }
    throw err;
  }
}

/**
 * Establece la nueva contraseña usando el token seguro
 * @param {string} token
 * @param {string} newPassword
 * @returns {Promise<Object>}
 */
export async function resetPasswordApi(token, newPassword) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Error al restablecer la contraseña");
    }

    return data;
  } catch (err) {
    if (err.name === "TypeError" || err.message?.includes("fetch")) {
      throw new Error("Error inesperado de conexión con el servidor backend.");
    }
    throw err;
  }
}

export default {
  loginApi,
  forgotPasswordApi,
  resetPasswordApi,
};

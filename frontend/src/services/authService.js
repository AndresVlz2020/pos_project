// frontend/src/services/authService.js
// Servicio de comunicación con la API Backend de autenticación JWT

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/**
 * Autentica un usuario contra el backend con email/password o userId/pin
 * @param {Object} credentials - { email, password, userId, pin }
 * @returns {Promise<Object>} { message, token, user }
 */
export async function loginApi({ email, password, userId, pin }) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, userId, pin }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const err = new Error(data.error || data.message || `Error al iniciar sesión (${response.status})`);
      err.status = response.status;
      throw err;
    }

    return data;
  } catch (err) {
    if (err.name === "TypeError" || err.message?.toLowerCase().includes("failed to fetch")) {
      const netErr = new Error("No fue posible conectar con el servicio en este momento.");
      netErr.isNetworkError = true;
      throw netErr;
    }
    throw err;
  }
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
 * Establece la nueva contraseña usando el código de 6 dígitos enviado por correo
 * @param {Object|string} params - { email, code, newPassword } o token
 * @param {string} [maybePassword] - newPassword si params es token
 * @returns {Promise<Object>}
 */
export async function resetPasswordApi(params, maybePassword) {
  try {
    const payload = typeof params === "object"
      ? params
      : { token: params, newPassword: maybePassword };

    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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

export function logout() {
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("token");
}

export default {
  loginApi,
  forgotPasswordApi,
  resetPasswordApi,
  logout,
};

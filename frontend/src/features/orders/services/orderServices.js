import { API_URL } from "@/features/config";

const ORDERS_URL = `${API_URL}/orders`;

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

/**
 * Obtiene todas las comandas/órdenes desde PostgreSQL
 */
export async function getTablesAvailability() {
  try {
    const response = await fetch(`${ORDERS_URL}/tables/availability`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Error al obtener la disponibilidad de mesas");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getTablesAvailability:", error);
    throw error;
  }
}

/**
 * Obtiene todas las comandas/órdenes desde PostgreSQL
 */
export async function getOrders({ status = null } = {}) {
  try {
    const params = new URLSearchParams();
    if (status) params.append("status", status);

    const url = params.toString() ? `${ORDERS_URL}?${params.toString()}` : ORDERS_URL;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Error al obtener las órdenes desde la base de datos");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getOrders:", error);
    throw error;
  }
}

/**
 * Obtiene el detalle de una comanda por ID o número de orden con sus ítems
 */
export async function getOrderById(id) {
  try {
    const response = await fetch(`${ORDERS_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Error al obtener la comanda");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getOrderById:", error);
    throw error;
  }
}

/**
 * Registra una nueva comanda/orden en PostgreSQL con sus ítems y descuenta stock
 */
export async function createOrder(orderData) {
  try {
    const response = await fetch(ORDERS_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Error al registrar la comanda en PostgreSQL");
    }

    return data;
  } catch (error) {
    console.error("Error en createOrder:", error);
    throw error;
  }
}

/**
 * Actualiza una comanda existente
 */
export async function updateOrder(id, orderData) {
  try {
    const response = await fetch(`${ORDERS_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Error al actualizar la comanda en PostgreSQL");
    }

    return data;
  } catch (error) {
    console.error("Error en updateOrder:", error);
    throw error;
  }
}

/**
 * Actualiza el estado de una comanda (Pagada / No Pagada / Anulada)
 */
export async function updateOrderStatus(id, status) {
  try {
    const response = await fetch(`${ORDERS_URL}/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Error al actualizar el estado de la comanda");
    }

    return data;
  } catch (error) {
    console.error("Error en updateOrderStatus:", error);
    throw error;
  }
}

/**
 * Anula una comanda y restaura el stock en PostgreSQL
 */
export async function cancelOrder(id, reason = "Cancelada por usuario") {
  try {
    const response = await fetch(`${ORDERS_URL}/${id}/cancel`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Error al anular la comanda");
    }

    return data;
  } catch (error) {
    console.error("Error en cancelOrder:", error);
    throw error;
  }
}

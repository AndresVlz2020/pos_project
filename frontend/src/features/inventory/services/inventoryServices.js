import { API_URL } from "@/features/config";
import { getAdminStepUpHeaders } from "@/shared/services/adminStepUpService";

const INVENTORY_URL = `${API_URL}/inventory`;

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
 * Obtiene la lista completa de inventario/insumos desde PostgreSQL
 */
export async function getInventory({ activeOnly = false, category = null } = {}) {
  try {
    const params = new URLSearchParams();
    if (activeOnly) params.append("activeOnly", "true");
    if (category) params.append("category", category);

    const url = params.toString() ? `${INVENTORY_URL}?${params.toString()}` : INVENTORY_URL;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Error al obtener el inventario desde la base de datos");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getInventory:", error);
    throw error;
  }
}

/**
 * Obtiene un insumo/ítem por ID
 */
export async function getInventoryById(id) {
  try {
    const response = await fetch(`${INVENTORY_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Error al obtener el ítem del inventario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getInventoryById:", error);
    throw error;
  }
}

/**
 * Registra un nuevo insumo/ítem de inventario en PostgreSQL
 */
export async function createInventory(itemData) {
  try {
    const response = await fetch(INVENTORY_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Error al registrar el insumo en el inventario");
    }

    return data;
  } catch (error) {
    console.error("Error en createInventory:", error);
    throw error;
  }
}

/**
 * Actualiza un insumo/ítem de inventario en PostgreSQL
 */
export async function updateInventory(id, itemData) {
  try {
    const response = await fetch(`${INVENTORY_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Error al actualizar el insumo en el inventario");
    }

    return data;
  } catch (error) {
    console.error("Error en updateInventory:", error);
    throw error;
  }
}

/**
 * Cambia en tiempo real el estado activo/inactivo (StatusSwitch) en PostgreSQL
 */
export async function updateInventoryStatus(id, is_active) {
  try {
    const actionLabel = is_active
      ? "Confirmar habilitación de insumo"
      : "Confirmar inhabilitación de insumo";
    const stepUpHeaders = await getAdminStepUpHeaders(actionLabel);

    const response = await fetch(`${INVENTORY_URL}/${id}/status`, {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        ...stepUpHeaders,
      },
      body: JSON.stringify({ is_active }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Error al actualizar el estado del insumo");
    }

    return data;
  } catch (error) {
    console.error("Error en updateInventoryStatus:", error);
    throw error;
  }
}

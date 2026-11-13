import { API_URL } from "@/features/config";
import { getAdminStepUpHeaders } from "@/shared/services/adminStepUpService";

const PRODUCTS_URL = `${API_URL}/products`;

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
 * Obtiene la lista completa de productos desde PostgreSQL
 */
export async function getProducts({ activeOnly = false, category = null } = {}) {
  try {
    const params = new URLSearchParams();
    if (activeOnly) params.append("activeOnly", "true");
    if (category) params.append("category", category);

    const url = params.toString() ? `${PRODUCTS_URL}?${params.toString()}` : PRODUCTS_URL;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Error al obtener los productos desde la base de datos");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getProducts:", error);
    throw error;
  }
}

/**
 * Obtiene un producto por su ID
 */
export async function getProductById(id) {
  try {
    const response = await fetch(`${PRODUCTS_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Error al obtener el producto");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getProductById:", error);
    throw error;
  }
}

/**
 * Registra un nuevo producto en PostgreSQL
 */
export async function createProduct(productData) {
  try {
    const response = await fetch(PRODUCTS_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Error al crear el producto en la base de datos");
    }

    return data;
  } catch (error) {
    console.error("Error en createProduct:", error);
    throw error;
  }
}

/**
 * Actualiza un producto existente en PostgreSQL
 */
export async function updateProduct(id, productData) {
  try {
    const response = await fetch(`${PRODUCTS_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Error al actualizar el producto");
    }

    return data;
  } catch (error) {
    console.error("Error en updateProduct:", error);
    throw error;
  }
}

/**
 * Actualiza en tiempo real el estado activo/inactivo (StatusSwitch) en PostgreSQL
 */
export async function updateProductStatus(id, is_active) {
  try {
    const actionLabel = is_active
      ? "Confirmar habilitación de platillo"
      : "Confirmar inhabilitación de platillo";
    const stepUpHeaders = await getAdminStepUpHeaders(actionLabel);

    const response = await fetch(`${PRODUCTS_URL}/${id}/status`, {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        ...stepUpHeaders,
      },
      body: JSON.stringify({ is_active }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Error al actualizar el estado del producto");
    }

    return data;
  } catch (error) {
    console.error("Error en updateProductStatus:", error);
    throw error;
  }
}

/**
 * Obtiene las categorías disponibles para productos
 */
export async function getCategories() {
  try {
    const response = await fetch(`${PRODUCTS_URL}/categories`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getCategories:", error);
    return [];
  }
}

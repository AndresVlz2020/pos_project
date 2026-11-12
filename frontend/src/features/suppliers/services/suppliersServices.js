import { API_URL } from "@/features/config";

const SUPPLIERS_URL = `${API_URL}/suppliers`;

function getStoredToken() {
  return (
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

function getHeaders() {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function createSupplier(supplierData) {
  try {
    const response = await fetch(SUPPLIERS_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(supplierData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Error al crear el proveedor");
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" || error.message?.includes("fetch")) {
      throw new Error("El servidor backend no responde. Verifica que esté iniciado e inténtalo de nuevo.");
    }
    throw error;
  }
}

export async function getAllSuppliers() {
  try {
    const response = await fetch(SUPPLIERS_URL, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || "Error al consultar los proveedores");
    }

    return await response.json();
  } catch (error) {
    if (error.name === "TypeError" || error.message?.includes("fetch")) {
      throw new Error("No se pudo conectar con el servidor backend. Verifica que el servidor esté iniciado e inténtalo de nuevo.");
    }
    throw error;
  }
}

export async function updateSupplier(id, supplierData) {
  try {
    const response = await fetch(`${SUPPLIERS_URL}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(supplierData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Error al actualizar el proveedor");
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" || error.message?.includes("fetch")) {
      throw new Error("Error de conexión con el backend al actualizar el proveedor");
    }
    throw error;
  }
}

export async function updateSupplierStatus(id, is_active) {
  try {
    const response = await fetch(`${SUPPLIERS_URL}/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ is_active }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Error al cambiar el estado del proveedor");
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" || error.message?.includes("fetch")) {
      throw new Error("Error de conexión con el backend al actualizar el estado");
    }
    throw error;
  }
}

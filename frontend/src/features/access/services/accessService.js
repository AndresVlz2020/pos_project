// frontend/src/features/access/services/accessService.js

const API_URL = "http://localhost:4000/api/access";

function getStoredToken() {
  return (
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

function getStoredUser() {
  try {
    const raw =
      localStorage.getItem("auth_user") ||
      sessionStorage.getItem("user") ||
      "null";
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function hasPermission(permissionCode) {
  const token = getStoredToken();
  const storedUser = getStoredUser();

  if (!token) {
    return { granted: false };
  }

  // Soporte de contingencia para tokens locales cuando el backend está sin conexión
  if (token.startsWith("token-admin-") || token.startsWith("token-pin-")) {
    const role = (storedUser?.role || "").toLowerCase();
    const isAdmin =
      Boolean(storedUser?.isAdmin || storedUser?.isSuperuser) ||
      role === "admin" ||
      role === "administrador";

    if (isAdmin) {
      return { granted: true };
    }

    if (permissionCode === "admin") {
      return { granted: false };
    }

    const rolePermissions = {
      cajero: [
        "list_product",
        "list_order",
        "create_order",
        "update_order",
        "list_inventory",
        "update_inventory",
      ],
      mesero: ["list_product", "list_order", "create_order", "update_order"],
      cocina: ["list_product", "list_order", "update_order"],
      cocinero: ["list_product", "list_order", "update_order"],
    };

    const allowed = rolePermissions[role] || [];
    return { granted: allowed.includes(permissionCode) };
  }

  const response = await fetch(`${API_URL}/check/${permissionCode}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error verificando permiso");
  }

  return response.json();
}

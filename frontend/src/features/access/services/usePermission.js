// frontend/src/features/access/services/usePermission.js
// Hook React: verifica un permiso RBAC del usuario activo.
// Retorna { granted, loading }. Los administradores locales autenticados
// siempre obtienen granted: true; para el resto se consulta /api/access/check.
import { useState, useEffect } from "react";
import { hasPermission } from "./accessService";

export default function usePermission(permissionCode) {
  const [state, setState] = useState({ granted: false, loading: true });

  useEffect(() => {
    let active = true;

    const currentUser = (() => {
      try {
        return JSON.parse(
          localStorage.getItem("auth_user") ||
            sessionStorage.getItem("user") ||
            "null"
        );
      } catch {
        return null;
      }
    })();

    const isAdmin =
      Boolean(currentUser?.isAdmin || currentUser?.isSuperuser) ||
      currentUser?.role === "Admin" ||
      currentUser?.role === "Administrador";

    if (isAdmin) {
      if (active) setState({ granted: true, loading: false });
      return () => {
        active = false;
      };
    }

    hasPermission(permissionCode)
      .then((res) => {
        if (active) setState({ granted: Boolean(res.granted), loading: false });
      })
      .catch(() => {
        if (active) setState({ granted: false, loading: false });
      });

    return () => {
      active = false;
    };
  }, [permissionCode]);

  return state;
}

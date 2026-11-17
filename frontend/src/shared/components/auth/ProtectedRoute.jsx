// frontend/src/shared/components/auth/ProtectedRoute.jsx

import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { hasPermission } from "@/features/access/services/accessService";
import { getAuthToken } from "@/shared/utils/authStorage";

export default function ProtectedRoute({ children, requiredPermission }) {
  const location = useLocation();
  const navigate = useNavigate();
  const token = getAuthToken();

  const [permCheck, setPermCheck] = useState({
    key: "",
    granted: false,
  });

  const currentKey =
    token && requiredPermission ? `${token}::${requiredPermission}` : "";

  useEffect(() => {
    const syncAuth = () => {
      if (!getAuthToken()) {
        navigate("/Auth", { replace: true });
      }
    };

    window.addEventListener("pageshow", syncAuth);
    window.addEventListener("popstate", syncAuth);
    return () => {
      window.removeEventListener("pageshow", syncAuth);
      window.removeEventListener("popstate", syncAuth);
    };
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (!currentKey) return undefined;

    let active = true;
    hasPermission(requiredPermission)
      .then((res) => {
        if (active) {
          setPermCheck({ key: currentKey, granted: Boolean(res?.granted) });
        }
      })
      .catch(() => {
        if (active) {
          setPermCheck({ key: currentKey, granted: false });
        }
      });

    return () => {
      active = false;
    };
  }, [currentKey, requiredPermission]);

  if (!token) {
    return <Navigate to="/Auth" replace state={{ from: location.pathname }} />;
  }

  if (requiredPermission) {
    if (permCheck.key !== currentKey) {
      return null;
    }
    if (!permCheck.granted) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

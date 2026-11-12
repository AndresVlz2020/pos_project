// frontend/src/shared/components/auth/ProtectedRoute.jsx

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { hasPermission } from "@/features/access/services/accessService";

export default function ProtectedRoute({ children, requiredPermission }) {
  const token =
    localStorage.getItem("auth_token") || sessionStorage.getItem("token");
  const [status, setStatus] = useState(
    requiredPermission ? "loading" : "allowed",
  );

  useEffect(() => {
    if (!token || !requiredPermission) {
      setStatus("allowed");
      return;
    }

    let active = true;
    setStatus("loading");

    hasPermission(requiredPermission)
      .then((res) => {
        if (active) {
          setStatus(res.granted ? "allowed" : "denied");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("denied");
        }
      });

    return () => {
      active = false;
    };
  }, [token, requiredPermission]);

  if (!token) {
    return <Navigate to="/Auth" replace />;
  }

  if (requiredPermission && status === "loading") {
    return null;
  }

  if (requiredPermission && status === "denied") {
    return <Navigate to="/" replace />;
  }

  return children;
}

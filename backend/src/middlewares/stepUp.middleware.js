// backend/src/middlewares/stepUp.middleware.js
// Exige token efímero de reconfirmación (huella o contraseña) únicamente cuando
// un usuario con rol de Administrador ejecuta acciones críticas.

import jwt from "jsonwebtoken";
import { getJWTSecret } from "../config/env.js";

export const requireAdminStepUp = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Token requerido" });
  }

  const isAdmin = Boolean(
    req.user.isAdmin ||
      req.user.isSuperuser ||
      String(req.user.role || "").toLowerCase() === "admin"
  );

  // Cajeros, meseros y cocineros únicamente usan biometría para acceso;
  // sus permisos siguen restringidos por requirePermission().
  if (!isAdmin) {
    return next();
  }

  const stepUpToken = req.get("x-admin-confirm-token");
  if (!stepUpToken) {
    return res.status(403).json({
      error: "Esta acción crítica requiere confirmación adicional del administrador.",
      code: "STEP_UP_REQUIRED",
    });
  }

  try {
    const decoded = jwt.verify(stepUpToken, getJWTSecret());
    if (
      decoded?.purpose !== "admin_step_up" ||
      Number(decoded?.userId) !== Number(req.user.id)
    ) {
      return res.status(403).json({
        error: "Token de confirmación de administrador inválido para esta sesión.",
        code: "STEP_UP_INVALID",
      });
    }

    return next();
  } catch {
    return res.status(403).json({
      error: "La confirmación de seguridad expiró o es inválida. Confirma nuevamente.",
      code: "STEP_UP_INVALID",
    });
  }
};

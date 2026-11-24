import { Router } from "express";
import { settingsController } from "./settings.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { requireAdminStepUp } from "../../middlewares/stepUp.middleware.js";

const router = Router();

// Público: pantalla de inicio / auth muestra correo de soporte a visitantes no registrados
router.get("/public", settingsController.getPublicSettings);

// Solo Administrador con verificación Step-Up puede editar el correo de soporte global
router.put(
  "/support-email",
  authenticateToken,
  requirePermission("admin"),
  requireAdminStepUp,
  settingsController.updateSupportEmail
);

export default router;

// backend/src/features/permissions/permissions.routes.js
// Catálogo de permisos — uso exclusivo del administrador (ruta /dashboard/access)

import { Router } from "express";
import { permissionsController } from "./permissions.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";

const router = Router();

router.get("/", authenticateToken, requirePermission("admin"), permissionsController.getAll);

export default router;

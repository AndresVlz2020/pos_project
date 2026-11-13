// backend/src/features/groups/groups.routes.js
// Gestión de grupos RBAC — uso exclusivo del administrador (ruta /dashboard/access)

import { Router } from "express";
import { groupsController } from "./groups.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { requireAdminStepUp } from "../../middlewares/stepUp.middleware.js";

const router = Router();

router.get("/", authenticateToken, requirePermission("admin"), groupsController.getAll);

router.get("/:groupId/permissions", authenticateToken, requirePermission("admin"), groupsController.getPermissionsByGroupId);

router.put("/:groupId/permissions", authenticateToken, requirePermission("admin"), requireAdminStepUp, groupsController.updatePermissions);

export default router;

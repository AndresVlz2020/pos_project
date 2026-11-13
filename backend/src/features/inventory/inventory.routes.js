import { Router } from "express";
import { inventoryController } from "./inventory.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { requireAdminStepUp } from "../../middlewares/stepUp.middleware.js";

const router = Router();

// Lectura: pública (POS de consulta)
router.get("/", inventoryController.getAll);
router.get("/:id", inventoryController.getById);

// Mutaciones: protegidas con JWT + permiso RBAC
router.post("/", authenticateToken, requirePermission("create_inventory"), inventoryController.create);
router.put("/:id", authenticateToken, requirePermission("update_inventory"), inventoryController.update);
router.patch("/:id/status", authenticateToken, requirePermission("disable_inventory"), requireAdminStepUp, inventoryController.updateStatus);

export default router;

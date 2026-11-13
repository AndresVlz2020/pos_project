import { Router } from "express";
import { orderController } from "./order.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { requireAdminStepUp } from "../../middlewares/stepUp.middleware.js";

const router = Router();

// Lectura pública: el POS y la pantalla de cocina consultan sin login (modo operación)
router.get("/tables/availability", orderController.getTables);
router.get("/", orderController.getAll);
router.get("/:id", orderController.getById);

// Mutaciones: requieren personal identificado con el permiso correspondiente
router.post("/", authenticateToken, requirePermission("create_order"), orderController.create);
router.put("/:id", authenticateToken, requirePermission("update_order"), orderController.update);
router.patch("/:id/status", authenticateToken, requirePermission("update_order"), orderController.updateStatus);
router.patch("/:id/cancel", authenticateToken, requirePermission("cancel_order"), requireAdminStepUp, orderController.cancel);

export default router;

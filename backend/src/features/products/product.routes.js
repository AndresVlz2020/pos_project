import { Router } from "express";
import { productController } from "./product.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";

const router = Router();

// Rutas de lectura: públicas (el POS las usa para catálogo sin login — modo demo)
router.get("/categories", productController.getCategories);
router.get("/", productController.getAll);
router.get("/:id", productController.getById);

// Rutas de mutación: protegidas con JWT + permiso RBAC correspondiente
router.post("/", authenticateToken, requirePermission("create_product"), productController.create);
router.put("/:id", authenticateToken, requirePermission("update_product"), productController.update);
router.patch("/:id/status", authenticateToken, requirePermission("disable_product"), productController.updateStatus);

export default router;

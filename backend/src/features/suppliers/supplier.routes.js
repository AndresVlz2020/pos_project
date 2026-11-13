import { Router } from "express";
import multer from "multer";
import { supplierController } from "./supplier.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { requireAdminStepUp } from "../../middlewares/stepUp.middleware.js";

const router = Router();
const upload = multer();

// Lectura: pública (directorio visible desde POS/inventario según pantalla)
router.get("/", supplierController.getAll);
router.get("/:id", supplierController.getById);

// Mutaciones: primero autenticación (antes de procesar multipart) y luego permiso RBAC
router.post("/", authenticateToken, requirePermission("create_supplier"), upload.none(), supplierController.create);
router.put("/:id", authenticateToken, requirePermission("update_supplier"), upload.none(), supplierController.update);
router.patch("/:id", authenticateToken, requirePermission("disable_supplier"), requireAdminStepUp, supplierController.updateSupplierStatus);

export default router;

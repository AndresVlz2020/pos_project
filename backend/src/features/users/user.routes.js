// Importamos Router desde express
// Router permite modularizar las rutas por feature
// y mantener el archivo principal de la app limpio
import { Router } from "express";

// Importamos el controlador de usuarios.
// El router nunca implementa lógica,
// Solo delega la ejecución al controller
import { userController } from "./user.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { requireAdminStepUp } from "../../middlewares/stepUp.middleware.js";

// Creamos una instancia de Router de express
const router = Router();

// Definimos la ruta para listar usuarios (pública: el POS y la pantalla de acceso la usan)
// GET /api/users
router.get("/", userController.getAll);

// Definimos la ruta para crear un usuario (requiere permiso de creación — solo admin + step-up)
// POST /api/users
router.post("/", authenticateToken, requirePermission("create_user"), requireAdminStepUp, userController.create);

// Actualizar estado activo/inactivo del usuario en tiempo real (solo administración + step-up)
// PATCH y PUT comparten el mismo controlador; ambos quedan protegidos
router.patch("/:userId/status", authenticateToken, requirePermission("disable_user"), requireAdminStepUp, userController.updateStatus);
router.put("/:userId/status", authenticateToken, requirePermission("disable_user"), requireAdminStepUp, userController.updateStatus);

// Permisos individuales del usuario (solo administración + step-up en actualización)
router.get("/:userId/permissions", authenticateToken, requirePermission("admin"), userController.getPermissionsByUserId);
router.put("/:userId/permissions", authenticateToken, requirePermission("admin"), requireAdminStepUp, userController.updatePermissions);

// Definimos la ruta para actualizar un usuario (requiere permiso de actualización + step-up)
// PUT /api/users/:id
router.put("/:id", authenticateToken, requirePermission("update_user"), requireAdminStepUp, userController.update);

// Exportamos el router para ser registrado en la aplicación principal
export default router;

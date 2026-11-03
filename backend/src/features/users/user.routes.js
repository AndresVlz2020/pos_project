// Importamos Router desde express
// Router permite modularizar las rutas por feature
// y mantener el archivo principal de la app limpio
import { Router } from "express";

// Importamos el controlador de usuarios.
// El router nunca implementa lógica,
// Solo delega la ejecución al controller
import { userController } from "./user.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

// Creamos una instancia de Router de express
const router = Router();

// Definimos la ruta para listar usuarios
// GET /api/users
router.get("/", userController.getAll);

// Definimos la ruta para crear un usuario
// POST /api/users
router.post("/", authenticateToken, userController.create);

// Actualizar estado activo/inactivo del usuario en tiempo real
router.patch("/:userId/status", userController.updateStatus);
router.put("/:userId/status", userController.updateStatus);

// Permisos individuales del usuario
router.get("/:userId/permissions", userController.getPermissionsByUserId);
router.put("/:userId/permissions", userController.updatePermissions);

// Definimos la ruta para actualizar un usuario
// PUT /api/users/:id
router.put("/:id", userController.update);

// Exportamos el router para ser registrado en la aplicación principal
export default router;

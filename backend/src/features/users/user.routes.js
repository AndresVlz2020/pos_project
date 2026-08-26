// Importamos Router desde express
// Router permite modularizar las rutas por feature
// y mantener el archivo principal de la app limpio
import { Router } from "express";

// Importamos el controlador de usuarios.
// El router nunca implementa lógica,
// Solo delega la ejecución al controller
import { userController } from "./user.controller.js";

// Creamos una instancia de Router de express
const router = Router();

// Definimos la ruta para crear un usuario
// POST /api/users
router.post("/", userController.create);

// Definimos la ruta para listar usuarios
// GET /api/users
router.get("/", userController.getAll);

// Exportamos el router para ser registrado en la aplicación principal
export default router;
// Importamos router desde Express.
// Router permite modularizar las rutas por feature
// Y mantener el archivo principal de la app limpio
import { Router } from "express";
import multer from "multer";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

// Importamos el controlador de usuarios.
// El router nunca implementa la logica.
// Solo delega la ejecucion al controller.
import { supplierController } from "./supplier.controller.js";

// Creamos una instancia del router de Express
const router = Router();

const upload = multer();

// Definimos la ruta para crear un usuario
// POST / users
// Cuando se recibe una peticion POST en la raiz del recurso.
// Express ejecuta el metodo create del controller.

// Aqui se procesa multipart/form-data

router.get(
    "/",
    authenticateToken,
    supplierController.getAll,
);

router.post(
    "/",
    authenticateToken,
    upload.none(),
    supplierController.create
)

router.patch(
    "/:id",
    supplierController.updateSupplierStatus,
)

// Exportamos el router para ser registrado en la aplicacion principal
// (ej: app.use("/users", router))
export default router;
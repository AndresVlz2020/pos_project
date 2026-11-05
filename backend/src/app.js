// Importamos Express, el framework base para construir el servidor HTTP
import express from "express";

// Importamos el middleware CORS
// Permite controlar qué orígenes pueden comunicarse con el backend
import cors from "cors";

// Importamos las rutas de cada feature
// Cada feature expone su propio router independiente
import userRoutes from "./features/users/user.routes.js";
import authRoutes from "./features/auth/auth.routes.js";
import accessRoutes from "./features/access/access.routes.js";
import groupsRoutes from "./features/groups/groups.routes.js";
import permissionsRoutes from "./features/permissions/permissions.routes.js";

// Creamos la instancia principal de la aplicación Express
const app = express();

// Middlewares de CORS
// Permite solicitudes únicamente desde el frontend en localhost:5173
app.use(cors({ origin: "http://localhost:5173" }));

// Middleware para parsear cuerpos de petición en formato JSON
app.use(express.json());

// Registro de routers por feature
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/permissions", permissionsRoutes);

// Exportamos la aplicación configurada
// El arranque del servidor se realiza desde el archivo server.js
export default app;

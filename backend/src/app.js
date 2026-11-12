// Importamos Express, el framework base para construir el servidor HTTP
import express from "express";
import { isProduction } from "./config/env.js";

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
import supplierRoutes from "./features/suppliers/supplier.routes.js";
import productRoutes from "./features/products/product.routes.js";
import inventoryRoutes from "./features/inventory/inventory.routes.js";
import orderRoutes from "./features/orders/order.routes.js";

// Creamos la instancia principal de la aplicación Express
const app = express();

// Middlewares de CORS
// Desarrollo: permite cualquier origen localhost/127.0.0.1 (cualquier puerto).
// Producción: permite el origen exacto FRONTEND_URL si está configurado, y nada más.
const allowedLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
app.use(
  cors({
    origin: (origin, callback) => {
      // Peticiones sin Origin (curl, Postman, server-to-server) se permiten.
      // El filtrado real de orígenes del navegador ocurre en el propio navegador vía CORS.
      if (!origin) return callback(null, true);
      if (allowedLocalhost.test(origin)) return callback(null, true);
      if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }
      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
  })
);

// Middleware para parsear cuerpos de petición en formato JSON
app.use(express.json());

// Registro de routers por feature
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/permissions", permissionsRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);

// Middleware global de control de errores para blindar la API contra caídas
app.use((err, req, res, next) => {
  console.error("❌ Error interceptado en el backend:", err.stack || err.message);
  const message = isProduction
    ? "Error interno del servidor"
    : err.message || "Error interno del servidor";
  res.status(err.status || 500).json({
    error: message,
  });
});

// Exportamos la aplicación configurada
// El arranque del servidor se realiza desde el archivo server.js
export default app;

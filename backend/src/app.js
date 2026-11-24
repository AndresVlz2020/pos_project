// Importamos Express, el framework base para construir el servidor HTTP
import express from "express";
import { isProduction } from "./config/env.js";
import { UPLOADS_ROOT } from "./middlewares/upload.middleware.js";

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
import sessionRoutes from "./features/sessions/session.routes.js";
import notificationRoutes from "./features/notifications/notification.routes.js";
import settingsRoutes from "./features/settings/settings.routes.js";

// Creamos la instancia principal de la aplicación Express
const app = express();

// Middlewares de CORS
// Desarrollo: permite cualquier origen localhost/127.0.0.1 (cualquier puerto).
// Producción: permite el mismo host tras Nginx/reverse-proxy y orígenes configurados en FRONTEND_URL/CORS_ORIGINS.
const allowedLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function getAllowedConfiguredOrigins() {
  const raw = [process.env.FRONTEND_URL, process.env.CORS_ORIGINS]
    .filter(Boolean)
    .join(",");
  return new Set(
    raw
      .split(",")
      .map((entry) => entry.trim().replace(/\/+$/, "").toLowerCase())
      .filter(Boolean)
  );
}

function isSameProxyHostOrigin(origin, req) {
  try {
    const parsedOrigin = new URL(origin);
    if (!["http:", "https:"].includes(parsedOrigin.protocol)) return false;

    const forwardedHost = String(
      req.headers["x-forwarded-host"] || req.headers.host || ""
    )
      .split(",")[0]
      .trim()
      .toLowerCase();

    if (!forwardedHost) return false;

    const originHost = parsedOrigin.host.toLowerCase();
    if (originHost === forwardedHost) return true;

    // Si el proxy envió Host sin puerto ($host), permitir coincidencia exacta de hostname
    const requestHostname = forwardedHost.split(":")[0];
    return !forwardedHost.includes(":") && parsedOrigin.hostname.toLowerCase() === requestHostname;
  } catch {
    return false;
  }
}

app.use(
  cors((req, callback) => {
    const origin = req.headers.origin;
    const normalizedOrigin = origin ? origin.trim().replace(/\/+$/, "").toLowerCase() : "";
    const configuredOrigins = getAllowedConfiguredOrigins();

    if (
      !origin ||
      allowedLocalhost.test(normalizedOrigin) ||
      configuredOrigins.has(normalizedOrigin) ||
      isSameProxyHostOrigin(origin, req)
    ) {
      return callback(null, { origin: true, credentials: true });
    }

    const corsErr = new Error(`Origen no permitido por CORS: ${origin}`);
    corsErr.status = 403;
    return callback(corsErr);
  })
);

// Middleware para parsear cuerpos de petición en formato JSON
app.use(express.json({ limit: "2mb" }));

// Servir archivos de imágenes almacenados físicamente en backend/uploads
app.use("/api/uploads", express.static(UPLOADS_ROOT, { maxAge: "7d" }));
app.use("/uploads", express.static(UPLOADS_ROOT, { maxAge: "7d" }));

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
app.use("/api/sessions", sessionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingsRoutes);

// Middleware global de control de errores para blindar la API contra caídas
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error("❌ Error interceptado en el backend:", err.stack || err.message);
  const message =
    isProduction && status >= 500
      ? "Error interno del servidor"
      : err.message || "Error interno del servidor";
  res.status(status).json({
    error: message,
  });
});

// Exportamos la aplicación configurada
// El arranque del servidor se realiza desde el archivo server.js
export default app;

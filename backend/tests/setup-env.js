// Setup por archivo de Vitest: fija el entorno de PRUEBA antes de que la app
// importe sus módulos (y su dotenv). Como dotenv NO sobreescribe variables ya
// definidas, podemos imponer aquí la BD de prueba, el secreto JWT de prueba y
// neutralizar el SMTP.
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

// 1) Fijar primero la BD de prueba y el entorno, ANTES de cargar dotenv.
process.env.NODE_ENV = "test";
process.env.DB_NAME = "pos_project_test";

// 2) Cargar credenciales reales (DB_HOST/USER/PASSWORD) desde backend/.env.
//    DB_NAME ya está fijado arriba, así que dotenv NO lo sobreescribirá.
dotenv.config({ path: path.join(backendRoot, ".env") });

// 3) Blindaje: jamás apuntar a la BD de desarrollo.
if (process.env.DB_NAME !== "pos_project_test") {
  throw new Error(
    `[SEGURIDAD] setup-env: DB_NAME inesperado "${process.env.DB_NAME}". ` +
      "Las pruebas exigen pos_project_test y no deben tocar pos_project."
  );
}

// 4) Secreto JWT exclusivo de pruebas (independiente del de producción).
process.env.JWT_SECRET = "vitest-jwt-secret-para-pruebas-0123456789abcdef";
process.env.JWT_EXPIRES = process.env.JWT_EXPIRES || "1h";

// 5) Neutralizar SMTP: nunca enviar correos reales durante los tests.
process.env.SMTP_USER = "";
process.env.SMTP_PASS = "";

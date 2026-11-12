// backend/src/config/env.js
// Carga y valida las variables de entorno del backend.
// Falla rápido y con un mensaje claro si falta un secreto crítico.

import dotenv from "dotenv";

dotenv.config();

const REQUIRED_SECRETS = ["JWT_SECRET", "DB_USER", "DB_NAME"];

export function validateEnv() {
  const missing = REQUIRED_SECRETS.filter((key) => !process.env[key] || !String(process.env[key]).trim());

  if (missing.length > 0) {
    throw new Error(
      `Configuración incompleta en backend/.env — faltan: ${missing.join(", ")}. ` +
      `Copie backend/.env.example a backend/.env y complétela. ` +
      `Nunca use valores por defecto para los secretos del sistema.`
    );
  }

  if (process.env.JWT_SECRET.length < 24) {
    throw new Error(
      "JWT_SECRET es demasiado corto (mínimo 24 caracteres). " +
      "Genera uno fuerte con:  node -e \"console.log(require('crypto').randomBytes(48).toString('base64'))\""
    );
  }

  return true;
}

export function getJWTSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || !String(secret).trim()) {
    throw new Error("JWT_SECRET no está configurado en backend/.env");
  }
  return secret;
}

export function getJWTExpires() {
  return process.env.JWT_EXPIRES || "1h";
}

export const NODE_ENV = process.env.NODE_ENV || "development";
export const isProduction = NODE_ENV === "production";

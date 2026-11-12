// Global setup de Vitest: se ejecuta UNA vez antes de correr las suites.
// Crea (desde cero) la base de datos de prueba `pos_project_test` y le aplica
// las migraciones. NUNCA toca la base de datos de desarrollo `pos_project`.
//
// Importante: los valores que se fijan aquí NO se propagan a los workers
// (cada worker los define en `setup-env.js`); aquí solo usamos las credenciales
// para crear la BD y lanzar el migrador como proceso hijo.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

const TEST_DB = "pos_project_test";

export default async function globalSetup() {
  // Cargar credenciales reales (host/usuario/clave) desde backend/.env.
  dotenv.config({ path: path.join(backendRoot, ".env") });

  const adminClient = new pg.Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: "postgres", // BD de mantenimiento
  });

  await adminClient.connect();

  // Cerrar conexiones huérfanas de una corrida anterior sobre la BD de prueba.
  await adminClient.query(
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()",
    [TEST_DB]
  );
  await adminClient.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
  await adminClient.query(`CREATE DATABASE ${TEST_DB}`);
  await adminClient.end();

  // Aplicar las 27 migraciones (incluyen semilla) contra la BD de prueba.
  try {
    execFileSync(process.execPath, ["src/scripts/migrate.js"], {
      cwd: backendRoot,
      env: { ...process.env, DB_NAME: TEST_DB, NODE_ENV: "test" },
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    const out = err.stdout ? String(err.stdout) : "";
    const errOut = err.stderr ? String(err.stderr) : "";
    throw new Error(
      `No se pudo migrar ${TEST_DB}.\n--- stdout ---\n${out}\n--- stderr ---\n${errOut}`
    );
  }
}

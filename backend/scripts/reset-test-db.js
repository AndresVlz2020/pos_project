// Recrea la base de datos de prueba `pos_project_test` y aplica las migraciones.
// Uso: node backend/scripts/reset-test-db.js   (desde la raíz del repo)
// NUNCA toca la base de datos de desarrollo `pos_project`.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const TEST_DB = "pos_project_test";

dotenv.config({ path: path.join(backendRoot, ".env") });

const client = new pg.Client({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: "postgres",
});

await client.connect();

await client.query(
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()",
  [TEST_DB]
);
await client.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
await client.query(`CREATE DATABASE ${TEST_DB}`);
await client.end();

execFileSync(process.execPath, ["src/scripts/migrate.js"], {
  cwd: backendRoot,
  env: { ...process.env, DB_NAME: TEST_DB, NODE_ENV: "test" },
  stdio: "inherit",
});

console.log(`[reset-test-db] ${TEST_DB} recreada y migrada correctamente.`);

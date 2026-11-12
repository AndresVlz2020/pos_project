// Helpers de base de datos para las pruebas.
// - `pool`: la misma instancia que usa la app (apunta a pos_project_test).
// - `resetDb`: deja la BD en estado de semilla limpio (DROP SCHEMA + migrar).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../../src/config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "../..");
const MIGRATIONS_DIR = path.join(backendRoot, "database", "migrations");

export { pool };

// Blindaje: las pruebas solo pueden operar contra la BD de prueba.
export function assertTestDb() {
  const db = pool.options?.database ?? process.env.DB_NAME;
  if (db !== "pos_project_test") {
    throw new Error(
      `[SEGURIDAD] Las pruebas apuntan a la BD incorrecta: "${db}". ` +
        "Solo se permite pos_project_test."
    );
  }
}

// Aplica las migraciones pendientes (idéntico a src/scripts/migrate.js).
export async function runMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT NOW()
    );
  `);

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const { rows } = await pool.query("SELECT name FROM _migrations");
  const executed = new Set(rows.map((r) => r.name));

  for (const file of files) {
    if (executed.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO _migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw new Error(`Migración falló (${file}): ${err.message}`);
    } finally {
      client.release();
    }
  }
}

// Deja la BD de prueba limpia: borra el esquema y vuelve a migrar (con semilla).
export async function resetDb() {
  assertTestDb();
  await pool.query("DROP SCHEMA public CASCADE");
  await pool.query("CREATE SCHEMA public");
  await runMigrations();
}

// Utilidades de consulta rápida.
export async function query(text, params) {
  assertTestDb();
  return pool.query(text, params);
}

export async function one(text, params) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

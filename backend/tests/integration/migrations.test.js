// Pruebas de migraciones: idempotencia, número de archivos y tabla _migrations.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { pool, resetDb, runMigrations, query } from "../helpers/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, "../../database/migrations");

beforeAll(async () => {
  await resetDb();
});

afterAll(async () => {
  await pool.end();
});

async function count(table) {
  const { rows } = await query(`SELECT COUNT(*)::int AS n FROM ${table}`);
  return rows[0].n;
}

describe("migraciones", () => {
  it("hay 29 archivos de migración", () => {
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"));
    expect(files).toHaveLength(29);
  });

  it("la tabla _migrations registra las 29 migraciones aplicadas", async () => {
    expect(await count("_migrations")).toBe(29);
  });

  it("re-ejecutar migraciones es idempotente (no duplica datos)", async () => {
    const before = {
      users: await count("users"),
      products: await count("products"),
      suppliers: await count("suppliers"),
      inventory: await count("inventory"),
      orders: await count("orders"),
    };

    // Segunda pasada: debe omitir todas las ya aplicadas sin error.
    await runMigrations();

    const after = {
      users: await count("users"),
      products: await count("products"),
      suppliers: await count("suppliers"),
      inventory: await count("inventory"),
      orders: await count("orders"),
    };

    expect(after).toEqual(before);
    expect(await count("_migrations")).toBe(29);
  });
});

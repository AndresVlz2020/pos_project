import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { pool } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runPendingMigrations({ closePool = false, exitOnError = false } = {}) {
  const migrationsDir = path.resolve(__dirname, "../../database/migrations");

  console.log("🚀 Iniciando ejecución de migraciones en PostgreSQL...");

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    const { rows: executedRows } = await pool.query("SELECT name FROM _migrations");
    const executedMigrations = new Set(executedRows.map((r) => r.name));

    let appliedCount = 0;
    for (const file of files) {
      if (executedMigrations.has(file)) {
        continue;
      }

      console.log(`⏳ Ejecutando migración: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO _migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        appliedCount += 1;
        console.log(`✅ Migración completada exitosamente: ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`❌ Error al ejecutar la migración ${file}:`, err.message);
        throw err;
      } finally {
        client.release();
      }
    }

    console.log(
      appliedCount > 0
        ? `🎉 ${appliedCount} migración(es) aplicada(s) correctamente.`
        : "⏩ Base de datos al día (sin migraciones pendientes)."
    );
  } catch (error) {
    console.error("❌ Falló el proceso de migraciones:", error.message);
    if (exitOnError) {
      process.exit(1);
    }
    throw error;
  } finally {
    if (closePool) {
      await pool.end();
    }
  }
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectRun) {
  runPendingMigrations({ closePool: true, exitOnError: true });
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const migrationsDir = path.resolve(__dirname, "../../database/migrations");

  console.log("🚀 Iniciando ejecución de migraciones en PostgreSQL...");

  try {
    // Crear tabla para registrar migraciones ejecutadas si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Leer archivos .sql
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    // Obtener migraciones ya aplicadas
    const { rows: executedRows } = await pool.query("SELECT name FROM _migrations");
    const executedMigrations = new Set(executedRows.map((r) => r.name));

    for (const file of files) {
      if (executedMigrations.has(file)) {
        console.log(`⏩ Migración ya aplicada: ${file}`);
        continue;
      }

      console.log(`⏳ Ejecutando migración: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      // Ejecutar dentro de una transacción
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO _migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`✅ Migración completada exitosamente: ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`❌ Error al ejecutar la migración ${file}:`, err.message);
        throw err;
      } finally {
        client.release();
      }
    }

    console.log("🎉 ¡Todas las migraciones se han ejecutado correctamente!");
  } catch (error) {
    console.error("❌ Falló el proceso de migraciones:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();

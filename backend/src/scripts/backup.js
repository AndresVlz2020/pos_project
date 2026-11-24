import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { pool } from "../config/db.js";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BACKUPS_DIR = path.resolve(__dirname, "../../backups");

function quoteIdent(ident) {
  return `"${String(ident).replace(/"/g, '""')}"`;
}

function escapeSqlText(str) {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
}

function formatSqlValue(value, colMeta) {
  if (value === null || value === undefined) return "NULL";

  const dataType = String(colMeta?.data_type || "").toLowerCase();
  const udtName = String(colMeta?.udt_name || "").toLowerCase();

  if (dataType === "json" || dataType === "jsonb" || udtName === "json" || udtName === "jsonb") {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    return `E'${escapeSqlText(serialized)}'::${udtName === "json" ? "json" : "jsonb"}`;
  }

  if (dataType === "array" || udtName.startsWith("_")) {
    const serialized = Array.isArray(value)
      ? `{${value
          .map((el) =>
            el === null || el === undefined
              ? "NULL"
              : `"${String(el).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
          )
          .join(",")}}`
      : String(value);
    return `E'${escapeSqlText(serialized)}'`;
  }

  if (Buffer.isBuffer(value)) {
    return `'\\x${value.toString("hex")}'::bytea`;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "NULL";
    if (dataType === "date") {
      return `'${value.toISOString().slice(0, 10)}'`;
    }
    return `'${value.toISOString()}'::timestamptz`;
  }

  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }

  return `E'${escapeSqlText(String(value))}'`;
}

function sortTablesByForeignKeys(tableNames, fkEdges) {
  const inDegree = new Map();
  const adj = new Map();

  for (const name of tableNames) {
    inDegree.set(name, 0);
    adj.set(name, new Set());
  }

  for (const { child, parent } of fkEdges) {
    if (!adj.has(parent) || !adj.has(child) || parent === child) continue;
    if (!adj.get(parent).has(child)) {
      adj.get(parent).add(child);
      inDegree.set(child, (inDegree.get(child) || 0) + 1);
    }
  }

  const queue = [...tableNames.filter((n) => inDegree.get(n) === 0)].sort();
  const ordered = [];

  while (queue.length > 0) {
    const current = queue.shift();
    ordered.push(current);
    for (const next of [...adj.get(current)].sort()) {
      const nextDeg = (inDegree.get(next) || 0) - 1;
      inDegree.set(next, nextDeg);
      if (nextDeg === 0) {
        queue.push(next);
        queue.sort();
      }
    }
  }

  // En caso de ciclos FK, añadir tablas restantes al final
  const seen = new Set(ordered);
  for (const name of tableNames.sort()) {
    if (!seen.has(name)) ordered.push(name);
  }
  return ordered;
}

function buildColumnDefinitionSql(col) {
  let typeSql = col.formatted_type;
  if (col.column_default && String(col.column_default).startsWith("nextval(")) {
    if (typeSql === "integer") typeSql = "SERIAL";
    else if (typeSql === "bigint") typeSql = "BIGSERIAL";
  }

  const parts = [quoteIdent(col.column_name), typeSql];
  if (col.is_nullable === "NO") parts.push("NOT NULL");
  if (col.column_default && !String(col.column_default).startsWith("nextval(")) {
    parts.push(`DEFAULT ${col.column_default}`);
  }
  return parts.join(" ");
}

async function tryPgDumpPlain(targetFile) {
  const dbHost = process.env.DB_HOST || "localhost";
  const dbPort = String(process.env.DB_PORT || 5432);
  const dbUser = process.env.DB_USER || "postgres";
  const dbName = process.env.DB_NAME || "pos_project";
  const dbPassword = process.env.DB_PASSWORD || "";

  await execFileAsync(
    "pg_dump",
    [
      "--format=plain",
      "--no-owner",
      "--no-acl",
      "--clean",
      "--if-exists",
      "--host",
      dbHost,
      "--port",
      dbPort,
      "--username",
      dbUser,
      "--file",
      targetFile,
      dbName,
    ],
    {
      env: { ...process.env, PGPASSWORD: dbPassword },
      timeout: 60000,
    }
  );
  return { method: "pg_dump", filePath: targetFile };
}

async function generateNativePlainSql(targetFile) {
  const client = await pool.connect();
  try {
    const dbRes = await client.query("SELECT current_database() AS db, version() AS ver;");
    const dbName = dbRes.rows[0]?.db || process.env.DB_NAME || "pos_project";
    const pgVer = dbRes.rows[0]?.ver || "PostgreSQL";

    const tablesRes = await client.query(
      `SELECT tablename
       FROM pg_tables
       WHERE schemaname = 'public'
       ORDER BY tablename ASC;`
    );
    const tableNames = tablesRes.rows.map((r) => r.tablename);

    const fkRes = await client.query(
      `SELECT DISTINCT
         tc.table_name AS child,
         ccu.table_name AS parent
       FROM information_schema.table_constraints tc
       JOIN information_schema.constraint_column_usage ccu
         ON tc.constraint_name = ccu.constraint_name
        AND tc.table_schema = ccu.table_schema
       WHERE tc.constraint_type = 'FOREIGN KEY'
         AND tc.table_schema = 'public';`
    );
    const orderedTables = sortTablesByForeignKeys(tableNames, fkRes.rows);

    const colsRes = await client.query(
      `SELECT
         c.table_name,
         c.column_name,
         c.ordinal_position,
         c.is_nullable,
         c.column_default,
         c.data_type,
         c.udt_name,
         pg_catalog.format_type(a.atttypid, a.atttypmod) AS formatted_type
       FROM information_schema.columns c
       JOIN pg_class cl ON cl.relname = c.table_name
       JOIN pg_namespace ns ON ns.oid = cl.relnamespace AND ns.nspname = c.table_schema
       JOIN pg_attribute a ON a.attrelid = cl.oid AND a.attname = c.column_name AND a.attnum > 0 AND NOT a.attisdropped
       WHERE c.table_schema = 'public'
       ORDER BY c.table_name, c.ordinal_position;`
    );

    const colsByTable = new Map();
    for (const row of colsRes.rows) {
      if (!colsByTable.has(row.table_name)) colsByTable.set(row.table_name, []);
      colsByTable.get(row.table_name).push(row);
    }

    const constraintsRes = await client.query(
      `SELECT
         cl.relname AS table_name,
         con.conname AS constraint_name,
         con.contype AS constraint_type,
         pg_get_constraintdef(con.oid, true) AS definition
       FROM pg_constraint con
       JOIN pg_class cl ON cl.oid = con.conrelid
       JOIN pg_namespace ns ON ns.oid = cl.relnamespace
       WHERE ns.nspname = 'public'
       ORDER BY cl.relname, con.contype DESC, con.conname;`
    );

    const constraintsByTable = new Map();
    for (const row of constraintsRes.rows) {
      if (!constraintsByTable.has(row.table_name)) constraintsByTable.set(row.table_name, []);
      constraintsByTable.get(row.table_name).push(row);
    }

    const idxRes = await client.query(
      `SELECT tablename, indexname, indexdef
       FROM pg_indexes
       WHERE schemaname = 'public'
         AND indexname NOT IN (
           SELECT conname FROM pg_constraint
           JOIN pg_namespace ns ON ns.oid = connamespace
           WHERE ns.nspname = 'public'
         )
       ORDER BY tablename, indexname;`
    );

    const lines = [
      "-- =============================================================================",
      `-- D.PIERO POS — Backup PostgreSQL en texto plano (${dbName})`,
      `-- Generado: ${new Date().toISOString()}`,
      `-- Motor: ${pgVer}`,
      "-- Formato: SQL plano (UTF-8) — compatible con psql -f <archivo.sql>",
      "-- =============================================================================",
      "",
      "BEGIN;",
      "SET client_encoding = 'UTF8';",
      "SET standard_conforming_strings = on;",
      "",
      "-- 1. Definición de tablas y restricciones primarias",
    ];

    for (const table of orderedTables) {
      const cols = colsByTable.get(table) || [];
      const cons = (constraintsByTable.get(table) || []).filter(
        (c) => c.constraint_type !== "f"
      );
      const defs = [
        ...cols.map((c) => `  ${buildColumnDefinitionSql(c)}`),
        ...cons.map((c) => `  CONSTRAINT ${quoteIdent(c.constraint_name)} ${c.definition}`),
      ];
      lines.push(`CREATE TABLE IF NOT EXISTS ${quoteIdent(table)} (`);
      lines.push(defs.join(",\n"));
      lines.push(");");
      lines.push("");
    }

    lines.push("-- 2. Claves foráneas e índices");
    for (const table of orderedTables) {
      const fks = (constraintsByTable.get(table) || []).filter(
        (c) => c.constraint_type === "f"
      );
      for (const fk of fks) {
        lines.push(`DO $$ BEGIN`);
        lines.push(
          `  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = E'${escapeSqlText(fk.constraint_name)}') THEN`
        );
        lines.push(
          `    ALTER TABLE ${quoteIdent(table)} ADD CONSTRAINT ${quoteIdent(fk.constraint_name)} ${fk.definition};`
        );
        lines.push("  END IF;");
        lines.push("END $$;");
      }
    }
    for (const idx of idxRes.rows) {
      const def = String(idx.indexdef).replace(
        /^CREATE\s+(UNIQUE\s+)?INDEX\s+/i,
        (_, uniq) => `CREATE ${uniq || ""}INDEX IF NOT EXISTS `
      );
      lines.push(`${def};`);
    }
    lines.push("");

    lines.push("-- 3. Limpieza segura y volcado de datos");
    if (orderedTables.length > 0) {
      lines.push(
        `TRUNCATE TABLE ${orderedTables.map(quoteIdent).join(", ")} RESTART IDENTITY CASCADE;`
      );
      lines.push("");
    }

    for (const table of orderedTables) {
      const cols = colsByTable.get(table) || [];
      if (cols.length === 0) continue;

      const dataRes = await client.query(`SELECT * FROM ${quoteIdent(table)};`);
      lines.push(`-- Datos de ${table} (${dataRes.rows.length} registros)`);

      if (dataRes.rows.length > 0) {
        const colList = cols.map((c) => quoteIdent(c.column_name)).join(", ");
        for (const row of dataRes.rows) {
          const vals = cols
            .map((c) => formatSqlValue(row[c.column_name], c))
            .join(", ");
          lines.push(
            `INSERT INTO ${quoteIdent(table)} (${colList}) VALUES (${vals});`
          );
        }
      }
      lines.push("");
    }

    lines.push("-- 4. Sincronización de secuencias SERIAL / BIGSERIAL");
    for (const table of orderedTables) {
      const cols = colsByTable.get(table) || [];
      for (const col of cols) {
        if (col.column_default && String(col.column_default).startsWith("nextval(")) {
          lines.push(
            `SELECT setval(pg_get_serial_sequence('${table}', '${col.column_name}'), COALESCE((SELECT MAX(${quoteIdent(col.column_name)}) FROM ${quoteIdent(table)}), 1), EXISTS (SELECT 1 FROM ${quoteIdent(table)}));`
          );
        }
      }
    }

    lines.push("");
    lines.push("COMMIT;");
    lines.push("");

    await fs.promises.writeFile(targetFile, lines.join("\n"), "utf8");
    return {
      method: "native-sql",
      filePath: targetFile,
      tablesCount: orderedTables.length,
    };
  } finally {
    client.release();
  }
}

export async function generatePlainTextBackup({ outputPath = null, preferNative = false } = {}) {
  await fs.promises.mkdir(BACKUPS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "_");
  const dbName = (process.env.DB_NAME || "pos_project").replace(/[^a-zA-Z0-9_-]+/g, "_");
  const targetFile = outputPath
    ? path.resolve(outputPath)
    : path.join(BACKUPS_DIR, `backup_${dbName}_${stamp}.sql`);

  await fs.promises.mkdir(path.dirname(targetFile), { recursive: true });

  if (!preferNative) {
    try {
      return await tryPgDumpPlain(targetFile);
    } catch {
      // Fallback limpio cuando pg_dump no está instalado (p.ej. node:24-alpine o Windows sin binarios PG en PATH)
    }
  }

  return await generateNativePlainSql(targetFile);
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectExecution) {
  const outArg = process.argv.find((a) => a.startsWith("--out="));
  const outputPath = outArg ? outArg.slice("--out=".length) : null;
  const preferNative = process.argv.includes("--native");

  generatePlainTextBackup({ outputPath, preferNative })
    .then(async (info) => {
      const stat = await fs.promises.stat(info.filePath);
      console.log(
        `✅ Backup en texto plano creado (${info.method}): ${info.filePath} (${stat.size} bytes)`
      );
    })
    .catch((err) => {
      console.error("❌ Error generando backup:", err.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await pool.end().catch(() => {});
    });
}

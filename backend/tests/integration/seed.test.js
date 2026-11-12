// Pruebas de integridad de la semilla reproducida por las migraciones.
// Verifica que `pos_project_test` queda con los datos maestros esperados
// tras correr las 27 migraciones desde una BD vacía.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { pool, resetDb, query } from "../helpers/db.js";

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

describe("semilla reproducida por migraciones", () => {
  it("siembra los usuarios operativos y el administrador", async () => {
    // Las migraciones reproducen 4 usuarios (admin + 3 operativos).
    // (El dev tiene 8: los otros 4 son datos creados a mano fuera de migraciones.)
    expect(await count("users")).toBe(4);

    const { rows } = await query(
      "SELECT user_email FROM users ORDER BY id"
    );
    const emails = rows.map((r) => r.user_email);
    expect(emails).toContain("admin@dpiero.com");
    expect(emails).toContain("carlos.mesero@dpiero.com");
    expect(emails).toContain("maria.caja@dpiero.com");
    expect(emails).toContain("ana.cocina@dpiero.com");
  });

  it("siembra 5 categorías, 12 productos y 26 proveedores", async () => {
    expect(await count("categories")).toBe(5);
    expect(await count("products")).toBe(12);
    expect(await count("suppliers")).toBe(26);
  });

  it("siembra 30 insumos de inventario y 10 mesas", async () => {
    expect(await count("inventory")).toBe(30);
    expect(await count("restaurant_tables")).toBe(10);
  });

  it("siembra 5 comandas de demostración con 3 ítems", async () => {
    expect(await count("orders")).toBe(5);
    expect(await count("order_items")).toBe(3);
  });

  it("siembra 21 permisos y 4 grupos de RBAC", async () => {
    expect(await count("permissions")).toBe(21);
    expect(await count("groups")).toBe(4);
  });

  it("vincula cada usuario a un grupo y replica permisos de grupo", async () => {
    const { rows: userGroups } = await query("SELECT DISTINCT user_id FROM user_groups");
    expect(userGroups).toHaveLength(4);

    // Cada grupo del RBAC tiene permisos asignados.
    const { rows: groupPerms } = await query(
      "SELECT group_id, COUNT(*)::int AS n FROM group_permissions GROUP BY group_id"
    );
    expect(groupPerms).toHaveLength(4);
    for (const row of groupPerms) expect(row.n).toBeGreaterThan(0);
  });
});

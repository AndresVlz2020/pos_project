// Pruebas de integración del módulo de grupos y permisos (RBAC).
// Verifica los endpoints de administrador y la matriz de permisos sembrada.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, getToken, auth, stepUpAuth } from "../helpers/api.js";
import { pool, resetDb, query } from "../helpers/db.js";

let adminToken;
let meseroToken;

beforeAll(async () => {
  await resetDb();
  adminToken = await getToken("admin");
  meseroToken = await getToken("mesero");
});

afterAll(async () => {
  await pool.end();
});

async function groupIdByName(name) {
  const { rows } = await query(
    "SELECT group_id FROM groups WHERE group_name = $1",
    [name]
  );
  return rows[0]?.group_id;
}

async function groupPermissionCodes(groupId) {
  const { rows } = await query(
    `SELECT p.permission_codename
     FROM group_permissions gp
     JOIN permissions p ON p.permission_id = gp.permission_id
     WHERE gp.group_id = $1
     ORDER BY p.permission_codename`,
    [groupId]
  );
  return rows.map((r) => r.permission_codename);
}

describe("listado de grupos", () => {
  it("admin lista los 4 grupos", async () => {
    const res = await api.get("/api/groups").set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
    const names = res.body.map((g) => g.group_name).sort();
    expect(names).toEqual(["Administrador", "Cajero", "Cocina", "Mesero"]);
  });

  it("mesero no puede listar grupos (403)", async () => {
    const res = await api.get("/api/groups").set(auth(meseroToken));
    expect(res.status).toBe(403);
  });
});

describe("matriz de permisos sembrada por grupo", () => {
  it("Administrador tiene los 21 permisos", async () => {
    const id = await groupIdByName("Administrador");
    const codes = await groupPermissionCodes(id);
    expect(codes).toHaveLength(21);
  });

  it("Mesero tiene 4 permisos de POS", async () => {
    const id = await groupIdByName("Mesero");
    const codes = await groupPermissionCodes(id);
    expect(codes).toEqual([
      "create_order",
      "list_order",
      "list_product",
      "update_order",
    ]);
  });

  it("Cajero tiene 7 permisos (POS + inventario, incl. deshabilitar)", async () => {
    const id = await groupIdByName("Cajero");
    const codes = await groupPermissionCodes(id);
    expect(codes).toEqual([
      "create_order",
      "disable_inventory",
      "list_inventory",
      "list_order",
      "list_product",
      "update_inventory",
      "update_order",
    ]);
  });

  it("Cocina tiene 3 permisos (solo consulta y actualizar comandas)", async () => {
    const id = await groupIdByName("Cocina");
    const codes = await groupPermissionCodes(id);
    expect(codes).toEqual(["list_order", "list_product", "update_order"]);
  });
});

describe("permisos por grupo (admin)", () => {
  it("consulta los permisos de un grupo (200)", async () => {
    const id = await groupIdByName("Mesero");
    const res = await api
      .get(`/api/groups/${id}/permissions`)
      .set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
  });

  it("actualiza permisos de un grupo y luego restaura", async () => {
    const id = await groupIdByName("Mesero");

    // Permiso actual que se va a mantener como único durante la prueba.
    const { rows } = await query(
      "SELECT permission_id FROM permissions WHERE permission_codename = 'list_product'"
    );
    const singlePermissionId = rows[0].permission_id;

    const before = await groupPermissionCodes(id);
    const adminHeaders = await stepUpAuth(adminToken);

    const res = await api
      .put(`/api/groups/${id}/permissions`)
      .set(adminHeaders)
      .send({ permissionIds: [singlePermissionId] });
    expect(res.status).toBe(200);

    const after = await groupPermissionCodes(id);
    expect(after).toEqual(["list_product"]);

    // Restaurar la matriz original (por si otras pruebas dependen de ella).
    const { rows: allIds } = await query(
      "SELECT permission_id, permission_codename FROM permissions"
    );
    const originalCodenameToId = new Map(
      allIds.map((r) => [r.permission_codename, r.permission_id])
    );
    const restoreIds = before.map((c) => originalCodenameToId.get(c));

    await api
      .put(`/api/groups/${id}/permissions`)
      .set(adminHeaders)
      .send({ permissionIds: restoreIds });

    const restored = await groupPermissionCodes(id);
    expect(restored).toEqual(before);
  });
});

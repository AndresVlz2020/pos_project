// Pruebas de integración del CRUD de proveedores.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, getToken, auth } from "../helpers/api.js";
import { pool, resetDb, one } from "../helpers/db.js";

let adminToken;

beforeAll(async () => {
  await resetDb();
  adminToken = await getToken("admin");
});

afterAll(async () => {
  await pool.end();
});

const baseSupplier = {
  supplierNit: "TEST-SUPP-001",
  supplierName: "TEST Proveedor S.A.S.",
  supplierEmail: "test@proveedor.test",
  supplierPhone: "3000000001",
  supplierDirection: "Calle 0",
  supplierObservation: "creado por pruebas",
};

describe("creación de proveedor", () => {
  it("admin crea un proveedor (201) con id", async () => {
    const res = await api
      .post("/api/suppliers")
      .set(auth(adminToken))
      .send(baseSupplier);
    expect(res.status).toBe(201);
    expect(res.body.supplier.id).toBeTruthy();
  });

  it("rechaza NIT duplicado (500 por violación de unicidad)", async () => {
    const first = await api
      .post("/api/suppliers")
      .set(auth(adminToken))
      .send({ ...baseSupplier, supplierNit: "TEST-SUPP-DUP" });
    expect(first.status).toBe(201);

    const dup = await api
      .post("/api/suppliers")
      .set(auth(adminToken))
      .send({ ...baseSupplier, supplierNit: "TEST-SUPP-DUP", supplierName: "Otro nombre" });
    expect(dup.status).toBe(500);
  });

  it("sin NIT ni nombre falla (500 por NOT NULL, no hay validación de entrada)", async () => {
    const res = await api
      .post("/api/suppliers")
      .set(auth(adminToken))
      .send({ supplierEmail: "sin-datos@proveedor.test" });
    expect(res.status).toBe(500);
  });
});

describe("lectura de proveedores", () => {
  it("lista todos (incluye los 26 de semilla)", async () => {
    const res = await api.get("/api/suppliers");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(26);
  });

  it("lee por id (200) y devuelve 404 si no existe", async () => {
    const created = await api
      .post("/api/suppliers")
      .set(auth(adminToken))
      .send({ ...baseSupplier, supplierNit: "TEST-SUPP-002" });
    const id = created.body.supplier.id;

    const ok = await api.get(`/api/suppliers/${id}`);
    expect(ok.status).toBe(200);
    expect(ok.body.nit).toBe("TEST-SUPP-002");

    const missing = await api.get("/api/suppliers/999999");
    expect(missing.status).toBe(404);
  });
});

describe("actualización y estado", () => {
  it("PUT parcial (solo teléfono) conserva NIT, nombre y email", async () => {
    const created = await api
      .post("/api/suppliers")
      .set(auth(adminToken))
      .send({ ...baseSupplier, supplierNit: "TEST-SUPP-003" });
    const id = created.body.supplier.id;

    const res = await api
      .put(`/api/suppliers/${id}`)
      .set(auth(adminToken))
      .send({ supplierPhone: "3009999999" });
    expect(res.status).toBe(200);

    const row = await one(
      "SELECT nit, company_name, email, phone FROM suppliers WHERE id = $1",
      [id]
    );
    expect(row.nit).toBe("TEST-SUPP-003");
    expect(row.company_name).toBe(baseSupplier.supplierName);
    expect(row.email).toBe(baseSupplier.supplierEmail);
    expect(row.phone).toBe("3009999999");
  });

  it("PATCH deshabilita el proveedor (is_active = false)", async () => {
    const created = await api
      .post("/api/suppliers")
      .set(auth(adminToken))
      .send({ ...baseSupplier, supplierNit: "TEST-SUPP-004" });
    const id = created.body.supplier.id;

    const res = await api
      .patch(`/api/suppliers/${id}`)
      .set(auth(adminToken))
      .send({ is_active: false });
    expect(res.status).toBe(200);

    const row = await one("SELECT is_active FROM suppliers WHERE id = $1", [id]);
    expect(row.is_active).toBe(false);
  });
});

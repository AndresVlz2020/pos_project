// Pruebas de integración del CRUD de inventario.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, getToken, auth, stepUpAuth } from "../helpers/api.js";
import { pool, resetDb, one } from "../helpers/db.js";

let adminToken;

beforeAll(async () => {
  await resetDb();
  adminToken = await getToken("admin");
});

afterAll(async () => {
  await pool.end();
});

describe("creación de insumo", () => {
  it("admin crea un insumo (201) con id", async () => {
    const res = await api.post("/api/inventory").set(auth(adminToken)).send({
      itemName: "TEST Insumo (kg)",
      category: "Carnes",
      currentStock: 50,
      minStock: 5,
      maxStock: 100,
      unitMeasure: "kg",
    });
    expect(res.status).toBe(201);
    expect(res.body.item.id).toBeTruthy();
  });

  it("rechaza insumo sin nombre (400)", async () => {
    const res = await api
      .post("/api/inventory")
      .set(auth(adminToken))
      .send({ currentStock: 10 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/nombre del insumo/i);
  });
});

describe("lectura de insumos", () => {
  it("lista todos (incluye los 30 de semilla)", async () => {
    const res = await api.get("/api/inventory");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(30);
  });

  it("lee por id (200) y devuelve 404 si no existe", async () => {
    const created = await api
      .post("/api/inventory")
      .set(auth(adminToken))
      .send({ itemName: "TEST Insumo Lectura (kg)", currentStock: 10 });
    const id = created.body.item.id;

    const ok = await api.get(`/api/inventory/${id}`);
    expect(ok.status).toBe(200);

    const missing = await api.get("/api/inventory/999999");
    expect(missing.status).toBe(404);
  });
});

describe("actualización y estado", () => {
  it("PUT actualiza stock y precio de compra", async () => {
    const created = await api
      .post("/api/inventory")
      .set(auth(adminToken))
      .send({ itemName: "TEST Insumo Update (kg)", currentStock: 20, priceBuy: 1000 });
    const id = created.body.item.id;

    const res = await api
      .put(`/api/inventory/${id}`)
      .set(auth(adminToken))
      .send({ currentStock: 42, priceBuy: 1500 });
    expect(res.status).toBe(200);

    const row = await one(
      "SELECT current_stock::numeric AS stock, price_buy::numeric AS price FROM inventory WHERE id = $1",
      [id]
    );
    expect(Number(row.stock)).toBe(42);
    expect(Number(row.price)).toBe(1500);
  });

  it("PATCH deshabilita el insumo (is_active = false, status Inactivo)", async () => {
    const created = await api
      .post("/api/inventory")
      .set(auth(adminToken))
      .send({ itemName: "TEST Insumo Estado (kg)", currentStock: 5 });
    const id = created.body.item.id;

    const res = await api
      .patch(`/api/inventory/${id}/status`)
      .set(await stepUpAuth(adminToken))
      .send({ isActive: false });
    expect(res.status).toBe(200);

    const row = await one(
      "SELECT is_active, status FROM inventory WHERE id = $1",
      [id]
    );
    expect(row.is_active).toBe(false);
    expect(row.status).toBe("Inactivo");
  });
});

// Pruebas de integración del CRUD de productos.
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

describe("creación de producto", () => {
  it("admin crea un producto (201) con id", async () => {
    const res = await api.post("/api/products").set(auth(adminToken)).send({
      name: "TEST Producto",
      price: 25000,
      code: "TEST-PROD-01",
      stock: 10,
    });
    expect(res.status).toBe(201);
    expect(res.body.product.id).toBeTruthy();
  });

  it("rechaza producto sin nombre (400)", async () => {
    const res = await api
      .post("/api/products")
      .set(auth(adminToken))
      .send({ price: 100 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/nombre/i);
  });

  it("rechaza precio negativo (400)", async () => {
    const res = await api
      .post("/api/products")
      .set(auth(adminToken))
      .send({ name: "TEST Negativo", price: -5 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/precio/i);
  });
});

describe("actualización y estado de producto", () => {
  it("PUT actualiza precio y descripción", async () => {
    const created = await api.post("/api/products").set(auth(adminToken)).send({
      name: "TEST Actualizable",
      price: 10000,
      code: "TEST-PROD-02",
    });
    const id = created.body.product.id;

    const res = await api
      .put(`/api/products/${id}`)
      .set(auth(adminToken))
      .send({ price: 15000, description: "nueva descripción" });
    expect(res.status).toBe(200);

    const row = await one(
      "SELECT price::numeric AS price, description FROM products WHERE id = $1",
      [id]
    );
    expect(Number(row.price)).toBe(15000);
    expect(row.description).toBe("nueva descripción");
  });

  it("PATCH status cambia disponibilidad (Disponible ↔ Inactivo)", async () => {
    const created = await api.post("/api/products").set(auth(adminToken)).send({
      name: "TEST Estado",
      price: 1000,
      code: "TEST-PROD-03",
    });
    const id = created.body.product.id;

    const off = await api
      .patch(`/api/products/${id}/status`)
      .set(auth(adminToken))
      .send({ isActive: false });
    expect(off.status).toBe(200);

    const row = await one(
      "SELECT is_active, status FROM products WHERE id = $1",
      [id]
    );
    expect(row.is_active).toBe(false);
    expect(row.status).toBe("Inactivo");
  });
});

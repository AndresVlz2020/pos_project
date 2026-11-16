// Pruebas de integración del CRUD de productos.
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
      .send({ price: 15000, description: "nueva descripción", stock: 25 });
    expect(res.status).toBe(200);
    expect(Number(res.body.product.stock)).toBe(25);

    const row = await one(
      "SELECT price::numeric AS price, description, stock FROM products WHERE id = $1",
      [id]
    );
    expect(Number(row.price)).toBe(15000);
    expect(row.description).toBe("nueva descripción");
    expect(Number(row.stock)).toBe(25);
  });

  it("PUT rechaza stock negativo (400)", async () => {
    const created = await api.post("/api/products").set(auth(adminToken)).send({
      name: "TEST Stock Negativo",
      price: 12000,
      code: "TEST-PROD-02B",
      stock: 5,
    });
    const id = created.body.product.id;

    const res = await api
      .put(`/api/products/${id}`)
      .set(auth(adminToken))
      .send({ stock: -3 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/stock/i);
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
      .set(await stepUpAuth(adminToken))
      .send({ isActive: false });
    expect(off.status).toBe(200);

    const row = await one(
      "SELECT is_active, status FROM products WHERE id = $1",
      [id]
    );
    expect(row.is_active).toBe(false);
    expect(row.status).toBe("Inactivo");
  });

  it("conserva la imagen personalizada en BD al crear, editar parcial y consultar", async () => {
    const customImg = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/";
    const created = await api.post("/api/products").set(auth(adminToken)).send({
      name: "TEST Imagen Producto",
      price: 19000,
      code: "TEST-IMG-01",
      stock: 10,
      imageUrl: customImg,
    });
    expect(created.status).toBe(201);
    const id = created.body.product.id;
    expect(created.body.product.image).toBe(customImg);

    const partialUpdate = await api
      .put(`/api/products/${id}`)
      .set(auth(adminToken))
      .send({ stock: 18 });
    expect(partialUpdate.status).toBe(200);
    expect(partialUpdate.body.product.image).toBe(customImg);

    const fetched = await api.get(`/api/products/${id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.image).toBe(customImg);
    expect(fetched.body.image_url).toBe(customImg);

    const withoutImg = await api.post("/api/products").set(auth(adminToken)).send({
      name: "TEST Sin Imagen",
      price: 9000,
      code: "TEST-IMG-02",
    });
    const noImgId = withoutImg.body.product.id;
    await api.put(`/api/products/${noImgId}`).set(auth(adminToken)).send({ stock: 7 });
    const rowNoImg = await one("SELECT image_url FROM products WHERE id = $1", [noImgId]);
    expect(rowNoImg.image_url).toBeNull();
  });
});

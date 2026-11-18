// Pruebas de integración del CRUD de productos y cálculo automático por insumos.
import fs from "fs";
import path from "path";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, getToken, auth, stepUpAuth } from "../helpers/api.js";
import { pool, resetDb, one } from "../helpers/db.js";
import { UPLOADS_ROOT } from "../../src/middlewares/upload.middleware.js";

let adminToken;
let baseInsumoId;
let secondInsumoId;

beforeAll(async () => {
  await resetDb();
  adminToken = await getToken("admin");

  const inv1 = await api.post("/api/inventory").set(auth(adminToken)).send({
    itemName: "TEST Insumo Base Prod (kg)",
    category: "Carnes",
    currentStock: 10,
    minStock: 1,
    unitMeasure: "kg",
  });
  baseInsumoId = inv1.body.item.id;

  const inv2 = await api.post("/api/inventory").set(auth(adminToken)).send({
    itemName: "TEST Insumo Secundario Prod (un)",
    category: "Panadería",
    currentStock: 6,
    minStock: 1,
    unitMeasure: "unidad",
  });
  secondInsumoId = inv2.body.item.id;
});

afterAll(async () => {
  await pool.end();
});

describe("creación de producto con bloqueo de stock manual", () => {
  it("admin crea un producto (201) vinculando insumos y calcula stock automático", async () => {
    const res = await api.post("/api/products").set(auth(adminToken)).send({
      name: "TEST Producto",
      price: 25000,
      code: "TEST-PROD-01",
      ingredients: [
        { insumoId: baseInsumoId, cantidadRequerida: 0.5 }, // rinde 20
        { insumoId: secondInsumoId, cantidadRequerida: 1 }, // rinde 6 -> min 6
      ],
    });
    expect(res.status).toBe(201);
    expect(res.body.product.id).toBeTruthy();
    expect(res.body.product.stockMode).toBe("recipe");
    expect(Number(res.body.product.stock)).toBe(6);
  });

  it("rechaza producto sin insumos vinculados (400)", async () => {
    const res = await api.post("/api/products").set(auth(adminToken)).send({
      name: "TEST Sin Receta",
      price: 15000,
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/insumo/i);
  });

  it("rechaza crear producto enviando stock manual (400)", async () => {
    const res = await api.post("/api/products").set(auth(adminToken)).send({
      name: "TEST Stock Manual",
      price: 15000,
      stock: 10,
      ingredients: [{ insumoId: baseInsumoId, cantidadRequerida: 1 }],
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/stock.*manualmente/i);
  });

  it("rechaza producto sin nombre (400)", async () => {
    const res = await api
      .post("/api/products")
      .set(auth(adminToken))
      .send({
        price: 100,
        ingredients: [{ insumoId: baseInsumoId, cantidadRequerida: 1 }],
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/nombre/i);
  });

  it("rechaza precio negativo (400)", async () => {
    const res = await api
      .post("/api/products")
      .set(auth(adminToken))
      .send({
        name: "TEST Negativo",
        price: -5,
        ingredients: [{ insumoId: baseInsumoId, cantidadRequerida: 1 }],
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/precio/i);
  });
});

describe("actualización y estado de producto", () => {
  it("PUT actualiza precio, descripción y receta, y rechaza editar stock manualmente (400)", async () => {
    const created = await api.post("/api/products").set(auth(adminToken)).send({
      name: "TEST Actualizable",
      price: 10000,
      code: "TEST-PROD-02",
      ingredients: [{ insumoId: baseInsumoId, cantidadRequerida: 1 }],
    });
    const id = created.body.product.id;

    const blockedStockEdit = await api
      .put(`/api/products/${id}`)
      .set(auth(adminToken))
      .send({ price: 15000, stock: 25 });
    expect(blockedStockEdit.status).toBe(400);
    expect(blockedStockEdit.body.error).toMatch(/manualmente/i);

    const res = await api
      .put(`/api/products/${id}`)
      .set(auth(adminToken))
      .send({
        price: 15000,
        description: "nueva descripción",
        ingredients: [{ insumoId: baseInsumoId, cantidadRequerida: 2 }], // 10 / 2 = 5
      });
    expect(res.status).toBe(200);
    expect(Number(res.body.product.stock)).toBe(5);

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
      ingredients: [{ insumoId: baseInsumoId, cantidadRequerida: 1 }],
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
      ingredients: [{ insumoId: baseInsumoId, cantidadRequerida: 1 }],
      imageUrl: customImg,
    });
    expect(created.status).toBe(201);
    const id = created.body.product.id;
    expect(created.body.product.image).toBe(customImg);

    const partialUpdate = await api
      .put(`/api/products/${id}`)
      .set(auth(adminToken))
      .send({ description: "edición parcial sin tocar imagen ni receta" });
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
      ingredients: [{ insumoId: baseInsumoId, cantidadRequerida: 1 }],
    });
    const noImgId = withoutImg.body.product.id;
    await api.put(`/api/products/${noImgId}`).set(auth(adminToken)).send({ price: 9500 });
    const rowNoImg = await one("SELECT image_url FROM products WHERE id = $1", [noImgId]);
    expect(rowNoImg.image_url).toBeNull();
  });

  it("guarda la imagen subida por multipart/form-data en backend/uploads/products junto con la receta y reemplaza la anterior", async () => {
    const firstBytes = Buffer.from("fake-png-content-1");
    const secondBytes = Buffer.from("fake-png-content-2");
    const createdFiles = [];

    try {
      const created = await api
        .post("/api/products")
        .set(auth(adminToken))
        .field("name", "TEST Upload Backend")
        .field("price", "32000")
        .field("code", "TEST-UPL-01")
        .field("isActive", "false")
        .field(
          "ingredients",
          JSON.stringify([{ insumoId: baseInsumoId, cantidadRequerida: 0.5 }])
        )
        .attach("image", firstBytes, {
          filename: "parrilla-test.png",
          contentType: "image/png",
        });

      expect(created.status).toBe(201);
      expect(created.body.product.is_active).toBe(false);
      expect(Number(created.body.product.stock)).toBe(20);
      const firstUrl = created.body.product.image;
      expect(firstUrl).toMatch(/^\/api\/uploads\/products\/.+\.png$/);

      const firstFilePath = path.join(UPLOADS_ROOT, "products", path.basename(firstUrl));
      createdFiles.push(firstFilePath);
      expect(fs.existsSync(firstFilePath)).toBe(true);

      const staticRes = await api.get(firstUrl);
      expect(staticRes.status).toBe(200);
      expect(Buffer.compare(Buffer.from(staticRes.body), firstBytes)).toBe(0);

      const productId = created.body.product.id;
      const updated = await api
        .put(`/api/products/${productId}`)
        .set(auth(adminToken))
        .field("price", "34000")
        .attach("image", secondBytes, {
          filename: "parrilla-v2.jpg",
          contentType: "image/jpeg",
        });

      expect(updated.status).toBe(200);
      const secondUrl = updated.body.product.image;
      expect(secondUrl).toMatch(/^\/api\/uploads\/products\/.+\.jpg$/);

      const secondFilePath = path.join(UPLOADS_ROOT, "products", path.basename(secondUrl));
      createdFiles.push(secondFilePath);
      expect(fs.existsSync(secondFilePath)).toBe(true);
      expect(fs.existsSync(firstFilePath)).toBe(false);

      const invalidRes = await api
        .post("/api/products")
        .set(auth(adminToken))
        .field("name", "TEST Invalid File")
        .field("price", "1000")
        .field(
          "ingredients",
          JSON.stringify([{ insumoId: baseInsumoId, cantidadRequerida: 1 }])
        )
        .attach("image", Buffer.from("not an image"), {
          filename: "script.txt",
          contentType: "text/plain",
        });
      expect(invalidRes.status).toBe(400);
    } finally {
      for (const filePath of createdFiles) {
        await fs.promises.unlink(filePath).catch(() => {});
      }
    }
  });
});

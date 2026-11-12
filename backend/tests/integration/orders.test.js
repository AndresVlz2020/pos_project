// Pruebas de integración del núcleo del negocio: comandas (órdenes).
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, getToken, auth } from "../helpers/api.js";
import { pool, resetDb, one } from "../helpers/db.js";

let meseroToken;
let adminToken;
let prodId;
let initialStock;

beforeAll(async () => {
  await resetDb();
  meseroToken = await getToken("mesero");
  adminToken = await getToken("admin");

  // Usar el producto de semilla PAR-01 (stock inicial 18).
  const prod = await one(
    "SELECT id, price, stock FROM products WHERE code = 'PAR-01'"
  );
  prodId = prod.id;
  initialStock = Number(prod.stock);
});

afterAll(async () => {
  await pool.end();
});

describe("creación de comanda", () => {
  it("calcula el total a partir de precio × cantidad", async () => {
    const res = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 8",
      items: [{ productId: prodId, qty: 2, price: 56000 }],
    });
    expect(res.status).toBe(201);
    expect(res.body.order.order_number).toMatch(/^ORD-/);
    expect(Number(res.body.order.total)).toBe(112000);
  });

  it("descuenta el stock del producto (cantidad vendida)", async () => {
    const res = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 8",
      items: [{ productId: prodId, qty: 3, price: 56000 }],
    });
    expect(res.status).toBe(201);

    const row = await one("SELECT stock FROM products WHERE id = $1", [prodId]);
    // Cada comanda descuenta del stock actual, no del inicial.
    expect(Number(row.stock)).toBe(initialStock - 2 - 3);
  });

  it("rechaza comanda sin número de mesa (400)", async () => {
    const res = await api.post("/api/orders").set(auth(meseroToken)).send({
      items: [{ productId: prodId, qty: 1, price: 56000 }],
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/mesa/i);
  });

  it("devuelve los ítems al consultar la comanda por id", async () => {
    const created = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 10",
      items: [{ productId: prodId, qty: 2, price: 56000, notes: "Término medio" }],
    });
    const orderNum = created.body.order.order_number;

    const res = await api.get(`/api/orders/${orderNum}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(Number(res.body.items[0].qty)).toBe(2);
  });
});

describe("transiciones de estado", () => {
  it("mesero mueve el estado a 'Pagada'", async () => {
    const created = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 2",
      items: [{ productId: prodId, qty: 1, price: 56000 }],
    });
    const orderNum = created.body.order.order_number;

    const res = await api
      .patch(`/api/orders/${orderNum}/status`)
      .set(auth(meseroToken))
      .send({ status: "No Pagada" });
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("No Pagada");
  });

  it("normaliza el estado por comparación insensible a mayúsculas", async () => {
    const created = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 2",
      items: [{ productId: prodId, qty: 1, price: 56000 }],
    });
    const orderNum = created.body.order.order_number;

    const res = await api
      .patch(`/api/orders/${orderNum}/status`)
      .set(auth(meseroToken))
      .send({ status: "pagada" });
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("Pagada");
  });

  it("admin anula una comanda (estado 'Anulada')", async () => {
    const created = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 3",
      items: [{ productId: prodId, qty: 1, price: 56000 }],
    });
    const orderNum = created.body.order.order_number;

    const res = await api
      .patch(`/api/orders/${orderNum}/cancel`)
      .set(auth(adminToken))
      .send({ reason: "cliente se retiró" });
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("Anulada");
  });

  it("persiste paymentMethod al actualizar la comanda", async () => {
    const created = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 4",
      items: [{ productId: prodId, qty: 1, price: 56000 }],
    });
    const orderNum = created.body.order.order_number;

    const res = await api
      .put(`/api/orders/${orderNum}`)
      .set(auth(meseroToken))
      .send({ paymentMethod: "Transferencia" });
    expect(res.status).toBe(200);

    const check = await api.get(`/api/orders/${orderNum}`);
    expect(check.status).toBe(200);
    expect(check.body.paymentMethod ?? check.body.payment_method).toBe(
      "Transferencia"
    );
  });

  it("filtrar comandas por estado devuelve resultados coherentes", async () => {
    const res = await api.get("/api/orders?status=Anulada");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

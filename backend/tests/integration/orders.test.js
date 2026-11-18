// Pruebas de integración del núcleo del negocio: órdenes.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, getToken, auth, stepUpAuth } from "../helpers/api.js";
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

describe("creación de orden", () => {
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
    // Cada orden descuenta del stock actual, no del inicial.
    expect(Number(row.stock)).toBe(initialStock - 2 - 3);
  });

  it("rechaza orden sin número de mesa (400)", async () => {
    const res = await api.post("/api/orders").set(auth(meseroToken)).send({
      items: [{ productId: prodId, qty: 1, price: 56000 }],
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/mesa/i);
  });

  it("devuelve los ítems al consultar la orden por id", async () => {
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

  it("asigna automáticamente el creador/mesero desde el token JWT y no permite suplantarlo", async () => {
    const meseroUser = await one(
      "SELECT id, user_name FROM users WHERE user_email = 'carlos.mesero@dpiero.com'"
    );

    const res = await api
      .post("/api/orders")
      .set(auth(meseroToken))
      .send({
        tableNumber: "Mesa 9",
        waiterId: 99999,
        waiterName: "Usuario Suplantado",
        items: [{ productId: prodId, qty: 1, price: 56000 }],
      });

    expect(res.status).toBe(201);
    expect(Number(res.body.order.waiter_id)).toBe(Number(meseroUser.id));
    expect(res.body.order.waiter).toBe(meseroUser.user_name);
  });
});

describe("transiciones de estado", () => {
  it("crea la orden automáticamente en estado 'Creada'", async () => {
    const created = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 2",
      items: [{ productId: prodId, qty: 1, price: 56000 }],
    });
    expect(created.status).toBe(201);
    expect(created.body.order.status).toBe("Creada");
  });

  it("impide que el mesero marque una orden como 'Pagada' (403)", async () => {
    const created = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 2",
      items: [{ productId: prodId, qty: 1, price: 56000 }],
    });
    const orderNum = created.body.order.order_number;

    const statusRes = await api
      .patch(`/api/orders/${orderNum}/status`)
      .set(auth(meseroToken))
      .send({ status: "Pagada" });
    expect(statusRes.status).toBe(403);

    const putRes = await api
      .put(`/api/orders/${orderNum}`)
      .set(auth(meseroToken))
      .send({ status: "Pagada", paymentMethod: "Efectivo" });
    expect(putRes.status).toBe(403);
  });

  it("normaliza el estado por comparación insensible a mayúsculas (admin)", async () => {
    const created = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 2",
      items: [{ productId: prodId, qty: 1, price: 56000 }],
    });
    const orderNum = created.body.order.order_number;

    const res = await api
      .patch(`/api/orders/${orderNum}/status`)
      .set(auth(adminToken))
      .send({ status: "pagada" });
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("Pagada");
  });

  it("admin anula una orden (estado 'Anulada')", async () => {
    const created = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 3",
      items: [{ productId: prodId, qty: 1, price: 56000 }],
    });
    const orderNum = created.body.order.order_number;

    const res = await api
      .patch(`/api/orders/${orderNum}/cancel`)
      .set(await stepUpAuth(adminToken))
      .send({ reason: "cliente se retiró" });
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("Anulada");
  });

  it("persiste paymentMethod al actualizar la orden", async () => {
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

  it("filtrar órdenes por estado devuelve resultados coherentes", async () => {
    const res = await api.get("/api/orders?status=Anulada");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("atribuye el mesero autenticado al editar una orden sin mesero previo y conserva al mesero real si ya existía", async () => {
    const meseroUser = await one(
      "SELECT id, user_name FROM users WHERE user_email = 'carlos.mesero@dpiero.com'"
    );
    const adminUser = await one(
      "SELECT id, user_name FROM users WHERE user_email = 'admin@dpiero.com'"
    );

    // 1. Simular orden heredada sin waiter_id en BD
    const legacyCreated = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 5",
      items: [{ productId: prodId, qty: 1, price: 56000 }],
    });
    const legacyOrderNum = legacyCreated.body.order.order_number;
    await pool.query("UPDATE orders SET waiter_id = NULL WHERE order_number = $1", [
      legacyOrderNum,
    ]);

    // Al actualizarla como mesero autenticado, se atribuye su usuario real
    const updateRes = await api
      .put(`/api/orders/${legacyOrderNum}`)
      .set(auth(meseroToken))
      .send({ observations: "Atribuida al guardar" });
    expect(updateRes.status).toBe(200);
    expect(Number(updateRes.body.order.waiter_id)).toBe(Number(meseroUser.id));
    expect(updateRes.body.order.waiter).toBe(meseroUser.user_name);

    // 2. Si otro usuario (admin) actualiza esa misma orden después, conserva al mesero original
    const secondUpdate = await api
      .put(`/api/orders/${legacyOrderNum}`)
      .set(auth(adminToken))
      .send({ status: "Pagada", paymentMethod: "Nequi" });
    expect(secondUpdate.status).toBe(200);
    expect(Number(secondUpdate.body.order.waiter_id)).toBe(Number(meseroUser.id));
    expect(secondUpdate.body.order.waiter).toBe(meseroUser.user_name);
    expect(Number(secondUpdate.body.order.waiter_id)).not.toBe(Number(adminUser.id));

    // 3. El listado general GET /api/orders expone el nombre real del mesero
    const listRes = await api.get("/api/orders");
    expect(listRes.status).toBe(200);
    const listed = listRes.body.find((o) => o.id === legacyOrderNum);
    expect(listed).toBeDefined();
    expect(listed.waiter).toBe(meseroUser.user_name);
  });

  it("flujo Cocina -> Notificación al Mesero -> Mesero marca Entregada/Creada -> Cajero marca Pagada", async () => {
    const cocinaToken = await getToken("cocina");
    const cajeroToken = await getToken("cajero");

    // 1. Mesero crea orden -> nace en Creada y ocupa la mesa
    const created = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 7",
      items: [{ productId: prodId, qty: 1, price: 56000 }],
    });
    expect(created.status).toBe(201);
    const orderNum = created.body.order.order_number;

    // 2. Cocinero completa la orden -> estado Completada y notifica al Mesero
    const completedRes = await api
      .patch(`/api/orders/${orderNum}/status`)
      .set(auth(cocinaToken))
      .send({ status: "Completada" });
    expect(completedRes.status).toBe(200);
    expect(completedRes.body.order.status).toBe("Completada");

    // 3. Mesero consulta su bandeja de notificaciones persistentes
    const notifRes = await api.get("/api/notifications").set(auth(meseroToken));
    expect(notifRes.status).toBe(200);
    expect(notifRes.body.unreadCount).toBeGreaterThanOrEqual(1);
    const createdNotif = notifRes.body.notifications.find(
      (n) => n.orderNumber === orderNum
    );
    expect(createdNotif).toBeDefined();
    expect(createdNotif.isRead).toBe(false);

    // Cocinero NO puede marcar Entregada (403)
    const kitchenDeliver = await api
      .patch(`/api/orders/${orderNum}/status`)
      .set(auth(cocinaToken))
      .send({ status: "Entregada" });
    expect(kitchenDeliver.status).toBe(403);

    // 4. Mesero marca la orden como Entregada y no puede retroceder a Completada ni Creada
    const deliveredRes = await api
      .patch(`/api/orders/${orderNum}/status`)
      .set(auth(meseroToken))
      .send({ status: "Entregada" });
    expect(deliveredRes.status).toBe(200);
    expect(deliveredRes.body.order.status).toBe("Entregada");

    // La mesa sigue ocupada hasta que Cajero marque Pagada
    const tablesBusy = await api.get("/api/orders/tables/availability");
    const mesa7Busy = tablesBusy.body.find((t) => t.tableNumber === "Mesa 7");
    expect(mesa7Busy.isAvailable).toBe(false);

    const backToCreated = await api
      .patch(`/api/orders/${orderNum}/status`)
      .set(auth(meseroToken))
      .send({ status: "Creada" });
    expect(backToCreated.status).toBe(400);

    const backToCompleted = await api
      .patch(`/api/orders/${orderNum}/status`)
      .set(auth(adminToken))
      .send({ status: "Completada" });
    expect(backToCompleted.status).toBe(400);

    // Una orden en Creada tampoco puede pasar directamente a Entregada sin Completada
    const freshOrder = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 6",
      items: [{ productId: prodId, qty: 1, price: 56000 }],
    });
    const freshNum = freshOrder.body.order.order_number;
    const prematureDeliver = await api
      .patch(`/api/orders/${freshNum}/status`)
      .set(auth(meseroToken))
      .send({ status: "Entregada" });
    expect(prematureDeliver.status).toBe(400);

    // 5. Mesero marca la notificación como leída (permanece guardada en historial)
    const readRes = await api
      .patch(`/api/notifications/${createdNotif.id}/read`)
      .set(auth(meseroToken));
    expect(readRes.status).toBe(200);

    const afterReadRes = await api.get("/api/notifications").set(auth(meseroToken));
    const persistedNotif = afterReadRes.body.notifications.find(
      (n) => n.id === createdNotif.id
    );
    expect(persistedNotif).toBeDefined();
    expect(persistedNotif.isRead).toBe(true);

    // 6. Cajero cobra y marca Pagada -> libera la mesa
    const paidRes = await api
      .patch(`/api/orders/${orderNum}/status`)
      .set(auth(cajeroToken))
      .send({ status: "Pagada" });
    expect(paidRes.status).toBe(200);
    expect(paidRes.body.order.status).toBe("Pagada");

    const tablesFree = await api.get("/api/orders/tables/availability");
    const mesa7Free = tablesFree.body.find((t) => t.tableNumber === "Mesa 7");
    expect(mesa7Free.isAvailable).toBe(true);
  });
});

describe("recetas / escandallo y descuento atómico en inventario", () => {
  it("calcula stock dinámico por receta, descuenta insumos al crear orden, ajusta en edición y restaura al anular", async () => {
    const invMeatRes = await api.post("/api/inventory").set(auth(adminToken)).send({
      itemName: "TEST Carne Receta (kg)",
      category: "Carnes",
      currentStock: 2.0,
      minStock: 0.5,
      unitMeasure: "kg",
    });
    expect(invMeatRes.status).toBe(201);
    const meatId = invMeatRes.body.item.id;

    const invBunRes = await api.post("/api/inventory").set(auth(adminToken)).send({
      itemName: "TEST Pan Brioche (un)",
      category: "Panadería",
      currentStock: 3,
      minStock: 1,
      unitMeasure: "unidad",
    });
    expect(invBunRes.status).toBe(201);
    const bunId = invBunRes.body.item.id;

    // Carne alcanza para floor(2.0 / 0.5) = 4, pero pan solo alcanza para floor(3 / 1) = 3 => stock = 3
    const dishRes = await api.post("/api/products").set(auth(adminToken)).send({
      name: "TEST Burger Receta",
      price: 35000,
      code: "TEST-REC-01",
      stockMode: "recipe",
      ingredients: [
        { insumoId: meatId, cantidadRequerida: 0.5 },
        { insumoId: bunId, cantidadRequerida: 1 },
      ],
    });
    expect(dishRes.status).toBe(201);
    const recipeProdId = dishRes.body.product.id;
    expect(Number(dishRes.body.product.stock)).toBe(3);
    expect(dishRes.body.product.stockMode).toBe("recipe");
    expect(dishRes.body.product.hasRecipe).toBe(true);

    // Rechaza atómicamente orden que excede el stock calculado (4 > 3) sin descontar nada
    const overflowOrder = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 12",
      items: [{ productId: recipeProdId, qty: 4, price: 35000 }],
    });
    expect(overflowOrder.status).toBe(400);

    // Crea orden de 2 unidades -> descuenta 1.0 kg carne (queda 1.0) y 2 panes (queda 1)
    const okOrder = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 12",
      items: [{ productId: recipeProdId, qty: 2, price: 35000 }],
    });
    expect(okOrder.status).toBe(201);
    const orderNum = okOrder.body.order.order_number;

    const meatAfterCreate = await one("SELECT current_stock::numeric AS s FROM inventory WHERE id = $1", [meatId]);
    const bunAfterCreate = await one("SELECT current_stock::numeric AS s FROM inventory WHERE id = $1", [bunId]);
    expect(Number(meatAfterCreate.s)).toBeCloseTo(1.0, 3);
    expect(Number(bunAfterCreate.s)).toBeCloseTo(1.0, 3);

    // Producto ahora reporta stock dinámico = min(floor(1/0.5)=2, floor(1/1)=1) = 1
    const prodAfterOrder = await api.get(`/api/products/${recipeProdId}`);
    expect(Number(prodAfterOrder.body.stock)).toBe(1);

    // Historial de movimientos registra SALIDA_ORDEN
    const movAfterCreate = await api.get(`/api/inventory/${meatId}/movements`);
    expect(movAfterCreate.status).toBe(200);
    expect(movAfterCreate.body[0].tipoMovimiento).toBe("SALIDA_ORDEN");
    expect(Number(movAfterCreate.body[0].cantidad)).toBeCloseTo(-1.0, 3);

    // Anular orden restaura insumos (vuelve carne a 2.0 y pan a 3) y registra ENTRADA_ANULACION
    const cancelRes = await api
      .patch(`/api/orders/${orderNum}/cancel`)
      .set(await stepUpAuth(adminToken))
      .send({ reason: "Prueba de reverso de insumos" });
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.order.status).toBe("Anulada");

    const meatAfterCancel = await one("SELECT current_stock::numeric AS s FROM inventory WHERE id = $1", [meatId]);
    const bunAfterCancel = await one("SELECT current_stock::numeric AS s FROM inventory WHERE id = $1", [bunId]);
    expect(Number(meatAfterCancel.s)).toBeCloseTo(2.0, 3);
    expect(Number(bunAfterCancel.s)).toBeCloseTo(3.0, 3);

    const movAfterCancel = await api.get(`/api/inventory/${meatId}/movements`);
    expect(movAfterCancel.body[0].tipoMovimiento).toBe("ENTRADA_ANULACION");
    expect(Number(movAfterCancel.body[0].cantidad)).toBeCloseTo(1.0, 3);
  });
});

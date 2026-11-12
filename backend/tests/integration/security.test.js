// Pruebas de seguridad y RBAC.
// Port permanente de la verificación manual (crud_suite2, 31/31) a una suite
// versionada en el repo. Cubre:
//   - Puertas públicas (GET) vs mutaciones protegidas (401 sin token).
//   - Tokens inválidos/manipulados → 401.
//   - RBAC por rol: 403 para rol insuficiente, 2xx para rol correcto.
//   - CORS con lista blanca.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import jwt from "jsonwebtoken";
import { api, getToken, auth } from "../helpers/api.js";
import { pool, resetDb } from "../helpers/db.js";

let tokens; // { admin, mesero, cajero, cocina }
let fixtures; // { prodId, invId, suppId, orderNum, userId }

beforeAll(async () => {
  await resetDb();
  tokens = {
    admin: await getToken("admin"),
    mesero: await getToken("mesero"),
    cajero: await getToken("cajero"),
    cocina: await getToken("cocina"),
  };

  // Fixtures que mutan: los crea el admin/mesero para que las rutas tengan un
  // id real sobre el que operar.
  const prod = await api
    .post("/api/products")
    .set(auth(tokens.admin))
    .send({ name: "TEST SEC Producto", price: 10000, code: "TEST-SEC-01", stock: 50 });
  const prodId = prod.body.product.id;

  const inv = await api
    .post("/api/inventory")
    .set(auth(tokens.admin))
    .send({ itemName: "TEST SEC Insumo (kg)", currentStock: 20, minStock: 1, maxStock: 50 });
  const invId = inv.body.item.id;

  const supp = await api
    .post("/api/suppliers")
    .set(auth(tokens.admin))
    .send({
      supplierNit: "TEST-SEC-001",
      supplierName: "TEST SEC Proveedor S.A.S.",
      supplierEmail: "sec@proveedor.test",
      supplierPhone: "3000000001",
      supplierDirection: "Calle 0",
    });
  const suppId = supp.body.supplier.id;

  const order = await api
    .post("/api/orders")
    .set(auth(tokens.mesero))
    .send({
      tableNumber: "Mesa 8",
      items: [{ productId: prodId, qty: 1, price: 10000 }],
      observations: "TEST SEC",
    });
  const orderNum = order.body.order.order_number;

  const user = await api
    .post("/api/users")
    .set(auth(tokens.admin))
    .send({
      userName: "TEST SEC Mesero",
      userEmail: "test.sec@dpiero.com",
      userDocumentNumber: "TEST-SEC-U",
      userDocumentTypes: "CC",
      userType: "mesero",
      pin: "5555",
    });
  const userId = user.body.userID;

  fixtures = { prodId, invId, suppId, orderNum, userId };
});

afterAll(async () => {
  await pool.end();
});

describe("mutaciones exigen token (401 sin autenticar)", () => {
  const cases = [
    ["POST", "/api/users"],
    ["PUT", "/api/users/1"],
    ["PATCH", "/api/users/1/status"],
    ["PUT", "/api/users/1/permissions"],
    ["GET", "/api/users/1/permissions"],
    ["POST", "/api/products"],
    ["PUT", "/api/products/1"],
    ["PATCH", "/api/products/1/status"],
    ["POST", "/api/inventory"],
    ["PUT", "/api/inventory/1"],
    ["PATCH", "/api/inventory/1/status"],
    ["POST", "/api/suppliers"],
    ["PUT", "/api/suppliers/1"],
    ["PATCH", "/api/suppliers/1"],
    ["POST", "/api/orders"],
    ["PUT", "/api/orders/ORD-001"],
    ["PATCH", "/api/orders/ORD-001/status"],
    ["PATCH", "/api/orders/ORD-001/cancel"],
    ["GET", "/api/groups"],
    ["GET", "/api/groups/1/permissions"],
    ["PUT", "/api/groups/1/permissions"],
    ["GET", "/api/permissions"],
    ["GET", "/api/access/check/create_order"],
  ];

  it.each(cases)("%s %s → 401 sin token", async (method, path) => {
    const res = await api[method.toLowerCase()](path);
    expect(res.status).toBe(401);
  });
});

describe("tokens inválidos o manipulados → 401", () => {
  it("rechaza token basura", async () => {
    const res = await api
      .post("/api/orders")
      .set(auth("esto-no-es-un-jwt-valido"))
      .send({ tableNumber: "Mesa 1" });
    expect(res.status).toBe(401);
  });

  it("rechaza JWT firmado con otro secreto", async () => {
    const forged = jwt.sign({ id: 1, role: "Admin" }, "otro-secreto-totalmente-distinto-123");
    const res = await api
      .post("/api/users")
      .set(auth(forged))
      .send({ userName: "Hacker" });
    expect(res.status).toBe(401);
  });

  it("rechaza JWT expirado", async () => {
    const expired = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: "-10s" });
    const res = await api
      .post("/api/users")
      .set(auth(expired))
      .send({ userName: "Hacker" });
    expect(res.status).toBe(401);
  });
});

describe("RBAC: rol insuficiente → 403", () => {
  const cases = [
    ["mesero", "POST", "/api/products", { name: "X", price: 1 }],
    ["mesero", "POST", "/api/users", { userName: "X" }],
    ["mesero", "PATCH", `/api/orders/${"__ORDER__"}/cancel`, {}],
    ["cocina", "POST", "/api/orders", { tableNumber: "Mesa 1" }],
    ["cocina", "POST", "/api/users", { userName: "X" }],
    ["cocina", "PUT", `/api/inventory/${"__INV__"}`, { currentStock: 1 }],
    ["cajero", "POST", "/api/products", { name: "X", price: 1 }],
    ["cajero", "PATCH", `/api/orders/${"__ORDER__"}/cancel`, {}],
  ];

  // Las rutas dependen de ids de fixtures creados en beforeAll, así que se
  // resuelven dentro del test (no a nivel de módulo).
  it("todos los casos de rol insuficiente → 403", async () => {
    for (const [role, method, rawPath, body] of cases) {
      const path = rawPath
        .replace("__ORDER__", fixtures.orderNum)
        .replace("__INV__", String(fixtures.invId));
      const res = await api[method.toLowerCase()](path)
        .set(auth(tokens[role]))
        .send(body);
      expect(res.status, `${role} ${method} ${path}`).toBe(403);
    }
  });
});

describe("RBAC: rol correcto → 2xx", () => {
  it("admin crea producto (201)", async () => {
    const res = await api
      .post("/api/products")
      .set(auth(tokens.admin))
      .send({ name: "TEST SEC Producto 2", price: 5000, code: "TEST-SEC-02", stock: 10 });
    expect(res.status).toBe(201);
  });

  it("mesero crea comanda (201)", async () => {
    const res = await api
      .post("/api/orders")
      .set(auth(tokens.mesero))
      .send({
        tableNumber: "Mesa 9",
        items: [{ productId: fixtures.prodId, qty: 1, price: 10000 }],
      });
    expect(res.status).toBe(201);
  });

  it("mesero actualiza estado de comanda (200)", async () => {
    const res = await api
      .patch(`/api/orders/${fixtures.orderNum}/status`)
      .set(auth(tokens.mesero))
      .send({ status: "No Pagada" });
    expect(res.status).toBe(200);
  });

  it("cocina actualiza estado de comanda (200)", async () => {
    const res = await api
      .patch(`/api/orders/${fixtures.orderNum}/status`)
      .set(auth(tokens.cocina))
      .send({ status: "No Pagada" });
    expect(res.status).toBe(200);
  });

  it("admin anula comanda (200)", async () => {
    const res = await api
      .patch(`/api/orders/${fixtures.orderNum}/cancel`)
      .set(auth(tokens.admin))
      .send({ reason: "prueba" });
    expect(res.status).toBe(200);
    expect(res.body.order.orderStatus || res.body.order.status).toBe("Anulada");
  });

  it("admin actualiza producto (200)", async () => {
    const res = await api
      .put(`/api/products/${fixtures.prodId}`)
      .set(auth(tokens.admin))
      .send({ price: 12000, description: "actualizado" });
    expect(res.status).toBe(200);
  });

  it("admin deshabilita y habilita producto (200)", async () => {
    const off = await api
      .patch(`/api/products/${fixtures.prodId}/status`)
      .set(auth(tokens.admin))
      .send({ isActive: false });
    expect(off.status).toBe(200);

    const on = await api
      .patch(`/api/products/${fixtures.prodId}/status`)
      .set(auth(tokens.admin))
      .send({ isActive: true });
    expect(on.status).toBe(200);
  });

  it("admin crea proveedor (201)", async () => {
    const res = await api
      .post("/api/suppliers")
      .set(auth(tokens.admin))
      .send({
        supplierNit: "TEST-SEC-002",
        supplierName: "TEST SEC Proveedor 2",
        supplierEmail: "sec2@proveedor.test",
        supplierPhone: "3000000002",
        supplierDirection: "Calle 1",
      });
    expect(res.status).toBe(201);
  });

  it("admin actualiza proveedor (200)", async () => {
    const res = await api
      .put(`/api/suppliers/${fixtures.suppId}`)
      .set(auth(tokens.admin))
      .send({ supplierPhone: "3009999999" });
    expect(res.status).toBe(200);
  });

  it("admin deshabilita proveedor (200)", async () => {
    const res = await api
      .patch(`/api/suppliers/${fixtures.suppId}`)
      .set(auth(tokens.admin))
      .send({ is_active: false });
    expect(res.status).toBe(200);
  });

  it("admin crea insumo (201)", async () => {
    const res = await api
      .post("/api/inventory")
      .set(auth(tokens.admin))
      .send({ itemName: "TEST SEC Insumo 2 (kg)", currentStock: 5 });
    expect(res.status).toBe(201);
  });

  it("admin y cajero actualizan insumo (200)", async () => {
    const asAdmin = await api
      .put(`/api/inventory/${fixtures.invId}`)
      .set(auth(tokens.admin))
      .send({ currentStock: 42 });
    expect(asAdmin.status).toBe(200);

    const asCajero = await api
      .put(`/api/inventory/${fixtures.invId}`)
      .set(auth(tokens.cajero))
      .send({ currentStock: 43 });
    expect(asCajero.status).toBe(200);
  });

  it("cajero deshabilita y habilita insumo en su área (200)", async () => {
    // Cajero: su área es gestión de inventario; tiene disable_inventory (0028).
    const off = await api
      .patch(`/api/inventory/${fixtures.invId}/status`)
      .set(auth(tokens.cajero))
      .send({ isActive: false });
    expect(off.status).toBe(200);

    const on = await api
      .patch(`/api/inventory/${fixtures.invId}/status`)
      .set(auth(tokens.cajero))
      .send({ isActive: true });
    expect(on.status).toBe(200);
  });

  it("cocina NO deshabilita insumos (403)", async () => {
    const res = await api
      .patch(`/api/inventory/${fixtures.invId}/status`)
      .set(auth(tokens.cocina))
      .send({ isActive: false });
    expect(res.status).toBe(403);
  });

  it("admin crea usuario (201)", async () => {
    const res = await api
      .post("/api/users")
      .set(auth(tokens.admin))
      .send({
        userName: "TEST SEC Mesero 2",
        userEmail: "test.sec2@dpiero.com",
        userDocumentNumber: "TEST-SEC-U2",
        userDocumentTypes: "CC",
        userType: "mesero",
        pin: "6666",
      });
    expect(res.status).toBe(201);
  });

  it("admin actualiza usuario (200) y consulta permisos (200)", async () => {
    const upd = await api
      .put(`/api/users/${fixtures.userId}`)
      .set(auth(tokens.admin))
      .send({ userPhone: "3007777777" });
    expect(upd.status).toBe(200);

    const perms = await api
      .get(`/api/users/${fixtures.userId}/permissions`)
      .set(auth(tokens.admin));
    expect(perms.status).toBe(200);
    expect(Array.isArray(perms.body)).toBe(true);
  });

  it("admin lista grupos (200); anónimo → 401", async () => {
    const ok = await api.get("/api/groups").set(auth(tokens.admin));
    expect(ok.status).toBe(200);

    const anon = await api.get("/api/groups");
    expect(anon.status).toBe(401);
  });

  it("admin lista permisos (200)", async () => {
    const res = await api.get("/api/permissions").set(auth(tokens.admin));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("mesero verifica su permiso create_order (true) y create_user (false)", async () => {
    const yes = await api
      .get("/api/access/check/create_order")
      .set(auth(tokens.mesero));
    expect(yes.status).toBe(200);
    expect(yes.body.granted).toBe(true);

    const no = await api
      .get("/api/access/check/create_user")
      .set(auth(tokens.mesero));
    expect(no.status).toBe(200);
    expect(no.body.granted).toBe(false);
  });
});

describe("GETs de operación siguen siendo públicos", () => {
  const cases = [
    ["/api/users"],
    ["/api/products"],
    ["/api/inventory"],
    ["/api/suppliers"],
    ["/api/orders"],
    ["/api/orders/tables/availability"],
  ];

  it.each(cases)("GET %s → 200 sin token", async (path) => {
    const res = await api.get(path);
    expect(res.status).toBe(200);
  });
});

describe("CORS (lista blanca)", () => {
  it("permite origen localhost", async () => {
    const res = await api
      .get("/api/products")
      .set("Origin", "http://localhost:5173");
    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });

  it("permite origen 127.0.0.1", async () => {
    const res = await api
      .get("/api/products")
      .set("Origin", "http://127.0.0.1:5173");
    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe("http://127.0.0.1:5173");
  });

  it("permite peticiones sin Origin (curl/server-to-server)", async () => {
    const res = await api.get("/api/products");
    expect(res.status).toBe(200);
  });

  it("rechaza origen no permitido", async () => {
    const res = await api
      .get("/api/products")
      .set("Origin", "http://evil.example.com");
    // El middleware CORS llama callback(error) → el manejador global responde 500.
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.error).toMatch(/CORS|no permitido/i);
  });
});

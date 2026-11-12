// Pruebas de integración del CRUD de usuarios.
// Incluye la regresión del bug de PUT parcial que producía un 500
// (violación user_email NOT NULL) al enviar solo el teléfono.
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

describe("creación de usuario", () => {
  it("admin crea un mesero operativo (201) sin contraseña", async () => {
    const res = await api.post("/api/users").set(auth(adminToken)).send({
      userName: "TEST Mesero Uno",
      userEmail: "test.mesero@dpiero.com",
      userDocumentNumber: "TEST-USR-001",
      userDocumentTypes: "CC",
      userType: "mesero",
      pin: "4321",
    });
    expect(res.status).toBe(201);
    expect(res.body.userID).toBeTruthy();
  });

  it("rechaza correo duplicado (500 por violación de unicidad)", async () => {
    const first = await api.post("/api/users").set(auth(adminToken)).send({
      userName: "TEST Duplicado",
      userEmail: "test.duplicado@dpiero.com",
      userDocumentNumber: "TEST-USR-DUP",
      userType: "mesero",
    });
    expect(first.status).toBe(201);

    const dup = await api.post("/api/users").set(auth(adminToken)).send({
      userName: "TEST Duplicado 2",
      userEmail: "test.duplicado@dpiero.com",
      userDocumentNumber: "TEST-USR-DUP2",
      userType: "mesero",
    });
    expect(dup.status).toBe(500);
  });
});

describe("actualización parcial (regresión del bug de PUT → 500)", () => {
  it("PUT solo-teléfono conserva email, nombre y tipo", async () => {
    const created = await api.post("/api/users").set(auth(adminToken)).send({
      userName: "TEST Parcial",
      userEmail: "test.parcial@dpiero.com",
      userPhone: "3001111111",
      userDocumentNumber: "TEST-USR-PAR",
      userDocumentTypes: "CC",
      userType: "mesero",
      pin: "1111",
    });
    const userId = created.body.userID;

    const res = await api
      .put(`/api/users/${userId}`)
      .set(auth(adminToken))
      .send({ userPhone: "3002222222" });

    expect(res.status).toBe(200);

    const row = await one(
      "SELECT user_email, user_name, user_phone FROM users WHERE id = $1",
      [userId]
    );
    expect(row.user_email).toBe("test.parcial@dpiero.com");
    expect(row.user_name).toBe("TEST Parcial");
    expect(row.user_phone).toBe("3002222222");
  });

  it("PUT con cuerpo vacío conserva todos los campos", async () => {
    const created = await api.post("/api/users").set(auth(adminToken)).send({
      userName: "TEST Vacio",
      userEmail: "test.vacio@dpiero.com",
      userDocumentNumber: "TEST-USR-VAC",
      userType: "mesero",
    });
    const userId = created.body.userID;

    const res = await api
      .put(`/api/users/${userId}`)
      .set(auth(adminToken))
      .send({});
    expect(res.status).toBe(200);

    const row = await one("SELECT user_email FROM users WHERE id = $1", [userId]);
    expect(row.user_email).toBe("test.vacio@dpiero.com");
  });
});

describe("estado activo/inactivo", () => {
  it("PATCH status cambia isActive y se refleja en la lista", async () => {
    const created = await api.post("/api/users").set(auth(adminToken)).send({
      userName: "TEST Estado",
      userEmail: "test.estado@dpiero.com",
      userDocumentNumber: "TEST-USR-EST",
      userType: "mesero",
    });
    const userId = created.body.userID;

    const off = await api
      .patch(`/api/users/${userId}/status`)
      .set(auth(adminToken))
      .send({ isActive: false });
    expect(off.status).toBe(200);

    const row = await one("SELECT is_active FROM users WHERE id = $1", [userId]);
    expect(row.is_active).toBe(false);
  });

  it("PATCH status a un usuario inexistente → 404", async () => {
    const res = await api
      .patch("/api/users/999999/status")
      .set(auth(adminToken))
      .send({ isActive: false });
    expect(res.status).toBe(404);
  });
});

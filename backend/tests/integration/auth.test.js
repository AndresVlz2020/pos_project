// Pruebas de integración de autenticación (login dual + recuperación de clave).
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, login, getToken, auth, SEED_USERS } from "../helpers/api.js";
import { pool, resetDb, one } from "../helpers/db.js";

beforeAll(async () => {
  await resetDb();
});

afterAll(async () => {
  await pool.end();
});

describe("login por correo + contraseña (administrador)", () => {
  it("inicia sesión con credenciales correctas y devuelve token", async () => {
    const res = await login(SEED_USERS.admin);
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe("admin@dpiero.com");
    expect(res.body.user.role).toBe("Admin");
  });

  it("rechaza contraseña incorrecta (401)", async () => {
    const res = await login({ email: "admin@dpiero.com", password: "incorrecta" });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Credenciales inválidas/);
  });

  it("rechaza usuario inexistente (401)", async () => {
    const res = await login({ email: "nadie@dpiero.com", password: "12345678" });
    expect(res.status).toBe(401);
  });

  it("rechaza cuando faltan credenciales (401)", async () => {
    const res = await login({ email: "admin@dpiero.com" });
    expect(res.status).toBe(401);
  });
});

describe("login por PIN (personal operativo)", () => {
  it("mesero entra con su PIN", async () => {
    const res = await login({ email: "carlos.mesero@dpiero.com", pin: "1234" });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("Mesero");
  });

  it("cajero entra con su PIN", async () => {
    const res = await login({ email: "maria.caja@dpiero.com", pin: "1234" });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("Cajero");
  });

  it("rechaza PIN incorrecto (401)", async () => {
    const res = await login({ email: "carlos.mesero@dpiero.com", pin: "9999" });
    expect(res.status).toBe(401);
  });

  it("rechaza usuario inactivo (401)", async () => {
    // Crear usuario de prueba, deshabilitarlo e intentar entrar.
    const adminToken = await getToken("admin");
    const created = await api
      .post("/api/users")
      .set(auth(adminToken))
      .send({
        userName: "TEST Inactivo",
        userEmail: "test.inactivo@dpiero.com",
        userDocumentNumber: "TEST-INACTIVO",
        userDocumentTypes: "CC",
        userType: "mesero",
        pin: "4321",
      });
    const userId = created.body.userID;

    await api
      .patch(`/api/users/${userId}/status`)
      .set(auth(adminToken))
      .send({ isActive: false });

    const res = await login({ email: "test.inactivo@dpiero.com", pin: "4321" });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/inactivo/i);
  });
});

describe("recuperación de contraseña (sin envío real de correo)", () => {
  it("flujo completo: olvidar → código en BD → restablecer → entrar", async () => {
    // 1) Solicitar código de recuperación (SMTP neutralizado: no envía correo real).
    const forgot = await api
      .post("/api/auth/forgot-password")
      .send({ email: "admin@dpiero.com" });
    expect(forgot.status).toBe(200);
    expect(forgot.body.email).toBe("admin@dpiero.com");

    // 2) Leer el código de 6 dígitos guardado en la BD de prueba.
    const row = await one(
      `SELECT code FROM password_reset_codes
       WHERE LOWER(email) = LOWER($1) AND used = false
       ORDER BY id DESC LIMIT 1`,
      ["admin@dpiero.com"]
    );
    expect(row).toBeTruthy();
    expect(row.code).toMatch(/^\d{6}$/);

    // 3) Restablecer la contraseña.
    const reset = await api.post("/api/auth/reset-password").send({
      email: "admin@dpiero.com",
      code: row.code,
      newPassword: "NuevaClaveSegura123",
    });
    expect(reset.status).toBe(200);

    // 4) Entrar con la nueva contraseña.
    const ok = await login({ email: "admin@dpiero.com", password: "NuevaClaveSegura123" });
    expect(ok.status).toBe(200);

    // 5) La contraseña anterior ya no funciona.
    const old = await login({ email: "admin@dpiero.com", password: "12345678" });
    expect(old.status).toBe(401);
  });

  it("rechaza código inválido (400)", async () => {
    const res = await api.post("/api/auth/reset-password").send({
      email: "admin@dpiero.com",
      code: "000000",
      newPassword: "NuevaClaveSegura123",
    });
    expect(res.status).toBe(400);
  });

  it("rechaza contraseña nueva demasiado corta (400)", async () => {
    const res = await api.post("/api/auth/reset-password").send({
      email: "admin@dpiero.com",
      code: "123456",
      newPassword: "corta",
    });
    expect(res.status).toBe(400);
  });

  it("rechaza correo inexistente en forgot-password (400)", async () => {
    const res = await api
      .post("/api/auth/forgot-password")
      .send({ email: "nadie@dpiero.com" });
    expect(res.status).toBe(400);
  });
});

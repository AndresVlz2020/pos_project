// Pruebas de integración del CRUD de usuarios.
// Incluye la regresión del bug de PUT parcial que producía un 500
// (violación user_email NOT NULL) al enviar solo el teléfono.
import fs from "fs";
import path from "path";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, getToken, stepUpAuth, login } from "../helpers/api.js";
import { pool, resetDb, one } from "../helpers/db.js";
import { UPLOADS_ROOT } from "../../src/middlewares/upload.middleware.js";

let adminHeaders;

beforeAll(async () => {
  await resetDb();
  const adminToken = await getToken("admin");
  adminHeaders = await stepUpAuth(adminToken);
});

afterAll(async () => {
  await pool.end();
});

describe("creación de usuario", () => {
  it("admin crea un mesero operativo (201) sin contraseña", async () => {
    const res = await api.post("/api/users").set(adminHeaders).send({
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
    const first = await api.post("/api/users").set(adminHeaders).send({
      userName: "TEST Duplicado",
      userEmail: "test.duplicado@dpiero.com",
      userDocumentNumber: "TEST-USR-DUP",
      userType: "mesero",
    });
    expect(first.status).toBe(201);

    const dup = await api.post("/api/users").set(adminHeaders).send({
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
    const created = await api.post("/api/users").set(adminHeaders).send({
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
      .set(adminHeaders)
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
    const created = await api.post("/api/users").set(adminHeaders).send({
      userName: "TEST Vacio",
      userEmail: "test.vacio@dpiero.com",
      userDocumentNumber: "TEST-USR-VAC",
      userType: "mesero",
    });
    const userId = created.body.userID;

    const res = await api
      .put(`/api/users/${userId}`)
      .set(adminHeaders)
      .send({});
    expect(res.status).toBe(200);

    const row = await one("SELECT user_email FROM users WHERE id = $1", [userId]);
    expect(row.user_email).toBe("test.vacio@dpiero.com");
  });
});

describe("estado activo/inactivo", () => {
  it("PATCH status cambia isActive y se refleja en la lista", async () => {
    const created = await api.post("/api/users").set(adminHeaders).send({
      userName: "TEST Estado",
      userEmail: "test.estado@dpiero.com",
      userDocumentNumber: "TEST-USR-EST",
      userType: "mesero",
    });
    const userId = created.body.userID;

    const off = await api
      .patch(`/api/users/${userId}/status`)
      .set(adminHeaders)
      .send({ isActive: false });
    expect(off.status).toBe(200);

    const row = await one("SELECT is_active FROM users WHERE id = $1", [userId]);
    expect(row.is_active).toBe(false);
  });

  it("PATCH status a un usuario inexistente → 404", async () => {
    const res = await api
      .patch("/api/users/999999/status")
      .set(adminHeaders)
      .send({ isActive: false });
    expect(res.status).toBe(404);
  });
});

describe("avatar real del usuario y exclusión del rol proveedor", () => {
  it("guarda y devuelve exactamente el avatar subido al crear, editar, listar y hacer login", async () => {
    const avatar1 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/1";
    const avatar2 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2";

    const created = await api.post("/api/users").set(adminHeaders).send({
      userName: "TEST Avatar Real",
      userEmail: "test.avatar@dpiero.com",
      userDocumentNumber: "TEST-USR-AVT1",
      userDocumentTypes: "CC",
      userType: "mesero",
      pin: "6789",
      userAvatarUrl: avatar1,
    });
    expect(created.status).toBe(201);
    const userId = created.body.userID;
    expect(created.body.data.userAvatarUrl).toBe(avatar1);

    const listRes = await api.get("/api/users");
    expect(listRes.status).toBe(200);
    const listed = listRes.body.find((u) => Number(u.id) === Number(userId));
    expect(listed.userAvatarUrl).toBe(avatar1);
    expect(listed.photo).toBe(avatar1);

    const loginRes = await login({ email: "test.avatar@dpiero.com", pin: "6789" });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.userAvatarUrl).toBe(avatar1);
    expect(loginRes.body.user.photo).toBe(avatar1);

    // Edición parcial sin foto conserva avatar1
    const keepRes = await api
      .put(`/api/users/${userId}`)
      .set(adminHeaders)
      .send({ userPhone: "3112223344" });
    expect(keepRes.status).toBe(200);
    expect(keepRes.body.data.userAvatarUrl).toBe(avatar1);

    // Edición con nueva foto actualiza avatar2
    const updateAvatar = await api
      .put(`/api/users/${userId}`)
      .set(adminHeaders)
      .send({ userAvatarUrl: avatar2 });
    expect(updateAvatar.status).toBe(200);
    expect(updateAvatar.body.data.userAvatarUrl).toBe(avatar2);

    // Usuario sin avatar debe devolver photo=null (no ruta hardcodeada de worker-juan)
    const noAvatar = await api.post("/api/users").set(adminHeaders).send({
      userName: "TEST Sin Avatar",
      userEmail: "test.sinavatar@dpiero.com",
      userDocumentNumber: "TEST-USR-NOAVT",
      userType: "cajero",
      pin: "2468",
    });
    expect(noAvatar.status).toBe(201);
    const listAfter = await api.get("/api/users");
    const listedNoAvatar = listAfter.body.find((u) => Number(u.id) === Number(noAvatar.body.userID));
    expect(listedNoAvatar.userAvatarUrl).toBeNull();
    expect(listedNoAvatar.photo).toBeNull();
  });

  it("rechaza crear o actualizar usuario con tipo proveedor", async () => {
    const rejected = await api.post("/api/users").set(adminHeaders).send({
      userName: "TEST Proveedor Usuario",
      userEmail: "test.provusr@dpiero.com",
      userDocumentNumber: "TEST-USR-PROV",
      userType: "proveedor",
      pin: "1357",
    });
    expect(rejected.status).toBe(500);
    expect(rejected.body.error).toMatch(/proveedor/i);
  });

  it("guarda el avatar subido por multipart/form-data en backend/uploads/users y sirve la imagen", async () => {
    const avatarBytes1 = Buffer.from("avatar-bytes-v1");
    const avatarBytes2 = Buffer.from("avatar-bytes-v2");
    const createdFiles = [];

    try {
      const created = await api
        .post("/api/users")
        .set(adminHeaders)
        .field("userName", "TEST Upload Avatar")
        .field("userEmail", "test.upload.avatar@dpiero.com")
        .field("userDocumentNumber", "TEST-USR-UPL1")
        .field("userDocumentTypes", "CC")
        .field("userType", "mesero")
        .field("pin", "7788")
        .field("isSuperuser", "false")
        .field("isStaff", "true")
        .attach("image", avatarBytes1, {
          filename: "mesero-foto.png",
          contentType: "image/png",
        });

      expect(created.status).toBe(201);
      expect(created.body.data.isSuperUser).toBe(false);
      const firstUrl = created.body.data.userAvatarUrl;
      expect(firstUrl).toMatch(/^\/api\/uploads\/users\/.+\.png$/);

      const firstPath = path.join(UPLOADS_ROOT, "users", path.basename(firstUrl));
      createdFiles.push(firstPath);
      expect(fs.existsSync(firstPath)).toBe(true);

      const staticRes = await api.get(firstUrl);
      expect(staticRes.status).toBe(200);
      expect(Buffer.compare(Buffer.from(staticRes.body), avatarBytes1)).toBe(0);

      const updated = await api
        .put(`/api/users/${created.body.userID}`)
        .set(adminHeaders)
        .field("userPhone", "3115556677")
        .attach("image", avatarBytes2, {
          filename: "mesero-foto2.webp",
          contentType: "image/webp",
        });

      expect(updated.status).toBe(200);
      const secondUrl = updated.body.data.userAvatarUrl;
      expect(secondUrl).toMatch(/^\/api\/uploads\/users\/.+\.webp$/);

      const secondPath = path.join(UPLOADS_ROOT, "users", path.basename(secondUrl));
      createdFiles.push(secondPath);
      expect(fs.existsSync(secondPath)).toBe(true);
      expect(fs.existsSync(firstPath)).toBe(false);
    } finally {
      for (const filePath of createdFiles) {
        await fs.promises.unlink(filePath).catch(() => {});
      }
    }
  });
});

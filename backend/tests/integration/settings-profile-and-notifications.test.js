import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, getToken, auth, stepUpAuth } from "../helpers/api.js";
import { pool, resetDb, one } from "../helpers/db.js";
import { generatePlainTextBackup } from "../../src/scripts/backup.js";

let adminToken;
let meseroToken;
let cocinaToken;
let cajeroToken;
let prodId;

beforeAll(async () => {
  await resetDb();
  adminToken = await getToken("admin");
  meseroToken = await getToken("mesero");
  cocinaToken = await getToken("cocina");
  cajeroToken = await getToken("cajero");

  const prod = await one("SELECT id FROM products WHERE code = 'PAR-01'");
  prodId = prod.id;
});

afterAll(async () => {
  await pool.end();
});

describe("correo de soporte, perfil propio y permisos de edición", () => {
  it("expone el correo de soporte públicamente en /api/settings/public y permite editarlo solo al Administrador con step-up", async () => {
    const publicRes = await api.get("/api/settings/public");
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.supportEmail).toBeTruthy();

    const nonAdminEdit = await api
      .put("/api/settings/support-email")
      .set(auth(meseroToken))
      .send({ supportEmail: "hacked@dpiero.com" });
    expect(nonAdminEdit.status).toBe(403);

    const noStepUp = await api
      .put("/api/settings/support-email")
      .set(auth(adminToken))
      .send({ supportEmail: "mesa.ayuda@dpiero.com" });
    expect(noStepUp.status).toBe(403);
    expect(noStepUp.body.code).toBe("STEP_UP_REQUIRED");

    const updated = await api
      .put("/api/settings/support-email")
      .set(await stepUpAuth(adminToken))
      .send({ supportEmail: "mesa.ayuda@dpiero.com" });
    expect(updated.status).toBe(200);
    expect(updated.body.supportEmail).toBe("mesa.ayuda@dpiero.com");

    const publicAfter = await api.get("/api/settings/public");
    expect(publicAfter.body.supportEmail).toBe("mesa.ayuda@dpiero.com");
  });

  it("permite inspeccionar perfil propio a cualquier rol sin exponer PIN, y solo Admin puede editar su perfil", async () => {
    const waiterProfile = await api.get("/api/auth/me").set(auth(meseroToken));
    expect(waiterProfile.status).toBe(200);
    expect(waiterProfile.body.profile.userEmail).toBe("carlos.mesero@dpiero.com");
    expect(waiterProfile.body.profile.pin).toBeUndefined();
    expect(waiterProfile.body.supportEmail).toBeTruthy();
    expect(waiterProfile.body.canEditProfile).toBe(false);
    expect(waiterProfile.body.canEditSupportEmail).toBe(false);

    const waiterEditAttempt = await api
      .put("/api/auth/me")
      .set(auth(meseroToken))
      .send({ userName: "No Autorizado" });
    expect(waiterEditAttempt.status).toBe(403);

    const adminProfile = await api.get("/api/auth/me").set(auth(adminToken));
    expect(adminProfile.status).toBe(200);
    expect(adminProfile.body.canEditProfile).toBe(true);
    expect(adminProfile.body.canEditSupportEmail).toBe(true);

    const adminUpdate = await api
      .put("/api/auth/me")
      .set(await stepUpAuth(adminToken))
      .send({
        userName: "Admin Actualizado",
        userPhone: "3112223344",
        supportEmail: "contacto@dpiero.com",
      });
    expect(adminUpdate.status).toBe(200);
    expect(adminUpdate.body.profile.userName).toBe("Admin Actualizado");
    expect(adminUpdate.body.profile.userPhone).toBe("3112223344");
    expect(adminUpdate.body.supportEmail).toBe("contacto@dpiero.com");
  });
});

describe("sesión activa para Administrador y resolución de notificaciones en Entregada/Pagada", () => {
  it("inicia y mantiene sesión activa también para el Administrador", async () => {
    const curr = await api.get("/api/sessions/current").set(auth(adminToken));
    expect(curr.status).toBe(200);
    expect(curr.body.session).toBeTruthy();
    expect(curr.body.session.startedAt).toBeTruthy();

    const hb = await api.post("/api/sessions/heartbeat").set(auth(adminToken));
    expect(hb.status).toBe(200);
    expect(hb.body.session).toBeTruthy();
  });

  it("marca automáticamente como resueltas las notificaciones cuando la orden pasa a Entregada o Pagada", async () => {
    const created = await api.post("/api/orders").set(auth(meseroToken)).send({
      tableNumber: "Mesa 6",
      items: [{ productId: prodId, qty: 1, price: 56000 }],
    });
    expect(created.status).toBe(201);
    const orderNum = created.body.order.order_number;

    const completed = await api
      .patch(`/api/orders/${orderNum}/status`)
      .set(auth(cocinaToken))
      .send({ status: "Completada" });
    expect(completed.status).toBe(200);

    const beforeDeliver = await api.get("/api/notifications").set(auth(meseroToken));
    const pending = beforeDeliver.body.notifications.find((n) => n.orderNumber === orderNum);
    expect(pending).toBeDefined();
    expect(pending.isRead).toBe(false);
    expect(beforeDeliver.body.unreadCount).toBeGreaterThanOrEqual(1);

    // Mesero marca la orden como Entregada -> la notificación ya no debe salir como no leída
    const delivered = await api
      .patch(`/api/orders/${orderNum}/status`)
      .set(auth(meseroToken))
      .send({ status: "Entregada" });
    expect(delivered.status).toBe(200);

    const afterDeliver = await api.get("/api/notifications").set(auth(meseroToken));
    const resolvedNotif = afterDeliver.body.notifications.find((n) => n.orderNumber === orderNum);
    expect(resolvedNotif).toBeDefined();
    expect(resolvedNotif.isRead).toBe(true);
    expect(afterDeliver.body.unreadCount).toBe(0);

    const paid = await api
      .patch(`/api/orders/${orderNum}/status`)
      .set(auth(cajeroToken))
      .send({ status: "Pagada" });
    expect(paid.status).toBe(200);

    const afterPaid = await api.get("/api/notifications").set(auth(adminToken));
    expect(afterPaid.body.unreadCount).toBe(0);
  });
});

describe("backup en texto plano SQL", () => {
  it("genera un archivo .sql válido en texto plano mediante el generador del backend", async () => {
    const tempFile = path.join(os.tmpdir(), `dpiero_backup_test_${Date.now()}.sql`);
    const info = await generatePlainTextBackup({
      outputPath: tempFile,
      preferNative: true,
    });
    expect(fs.existsSync(info.filePath)).toBe(true);
    const content = fs.readFileSync(info.filePath, "utf8");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS");
    expect(content).toContain('INSERT INTO "users"');
    expect(content).toContain("app_settings");
    fs.unlinkSync(tempFile);
  });
});

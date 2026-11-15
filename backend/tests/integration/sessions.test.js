// Pruebas de integración para el ciclo de sesiones/turnos y cierre seguro de sesiones inactivas.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, getToken, auth, SEED_USERS } from "../helpers/api.js";
import { pool, resetDb, one, query } from "../helpers/db.js";

let adminToken;
let meseroToken;
let cajeroToken;
let meseroId;
let cajeroId;

beforeAll(async () => {
  await resetDb();
  adminToken = await getToken("admin");
  meseroToken = await getToken("mesero");
  cajeroToken = await getToken("cajero");

  const meseroRow = await one("SELECT id FROM users WHERE user_email = $1", [
    SEED_USERS.mesero.email,
  ]);
  const cajeroRow = await one("SELECT id FROM users WHERE user_email = $1", [
    SEED_USERS.cajero.email,
  ]);
  meseroId = meseroRow.id;
  cajeroId = cajeroRow.id;
});

afterAll(async () => {
  await pool.end();
});

describe("sesiones de turno e historial sin acumulación falsa", () => {
  it("cierra sesiones abandonadas hace días usando last_seen_at al consultar historial (no 120h)", async () => {
    await query("DELETE FROM user_sessions WHERE user_id IN ($1, $2)", [meseroId, cajeroId]);

    // Insertar sesión abandonada hace 120 horas con actividad real de solo 30 minutos
    const stale = await one(
      `
      INSERT INTO user_sessions (user_id, started_at, last_seen_at, ended_at, duration_seconds)
      VALUES (
        $1,
        NOW() - INTERVAL '120 hours',
        NOW() - INTERVAL '120 hours' + INTERVAL '30 minutes',
        NULL,
        1800
      )
      RETURNING id
      `,
      [cajeroId]
    );

    const res = await api.get("/api/sessions/history").set(auth(adminToken));
    expect(res.status).toBe(200);

    const row = res.body.find((r) => r.id === stale.id);
    expect(row).toBeTruthy();
    expect(row.isActive).toBe(false);
    expect(row.endedAt).toBeTruthy();
    expect(row.durationSeconds).toBeGreaterThanOrEqual(1795);
    expect(row.durationSeconds).toBeLessThan(2000);
  });

  it("POST /api/sessions/end no infla una sesión inactiva (>15m) a 120 horas", async () => {
    await query("DELETE FROM user_sessions WHERE user_id = $1", [cajeroId]);

    const stale = await one(
      `
      INSERT INTO user_sessions (user_id, started_at, last_seen_at, ended_at, duration_seconds)
      VALUES (
        $1,
        NOW() - INTERVAL '120 hours',
        NOW() - INTERVAL '120 hours' + INTERVAL '20 minutes',
        NULL,
        1200
      )
      RETURNING id
      `,
      [cajeroId]
    );

    const endRes = await api.post("/api/sessions/end").set(auth(cajeroToken));
    expect(endRes.status).toBe(200);

    const updated = await one(
      "SELECT ended_at, duration_seconds FROM user_sessions WHERE id = $1",
      [stale.id]
    );
    expect(updated.ended_at).toBeTruthy();
    expect(updated.duration_seconds).toBeGreaterThanOrEqual(1195);
    expect(updated.duration_seconds).toBeLessThan(1500);
  });

  it("POST /api/sessions/heartbeat cierra sesión expirada (>15m) e inicia una nueva en 0s", async () => {
    await query("DELETE FROM user_sessions WHERE user_id = $1", [meseroId]);

    const expired = await one(
      `
      INSERT INTO user_sessions (user_id, started_at, last_seen_at, ended_at, duration_seconds)
      VALUES (
        $1,
        NOW() - INTERVAL '48 hours',
        NOW() - INTERVAL '48 hours' + INTERVAL '10 minutes',
        NULL,
        600
      )
      RETURNING id
      `,
      [meseroId]
    );

    const hbRes = await api.post("/api/sessions/heartbeat").set(auth(meseroToken));
    expect(hbRes.status).toBe(200);
    expect(hbRes.body.session.id).not.toBe(expired.id);
    expect(hbRes.body.session.durationSeconds).toBeLessThan(60);

    const oldRow = await one(
      "SELECT ended_at, duration_seconds FROM user_sessions WHERE id = $1",
      [expired.id]
    );
    expect(oldRow.ended_at).toBeTruthy();
    expect(oldRow.duration_seconds).toBeLessThan(900);
  });

  it("admin puede filtrar historial por trabajador y trabajador normal solo ve el suyo", async () => {
    const adminFiltered = await api
      .get(`/api/sessions/history?userId=${cajeroId}`)
      .set(auth(adminToken));
    expect(adminFiltered.status).toBe(200);
    expect(adminFiltered.body.length).toBeGreaterThan(0);
    expect(adminFiltered.body.every((r) => Number(r.userId) === cajeroId)).toBe(true);

    const waiterAttempt = await api
      .get(`/api/sessions/history?userId=${cajeroId}`)
      .set(auth(meseroToken));
    expect(waiterAttempt.status).toBe(200);
    expect(waiterAttempt.body.every((r) => Number(r.userId) === meseroId)).toBe(true);
  });
});

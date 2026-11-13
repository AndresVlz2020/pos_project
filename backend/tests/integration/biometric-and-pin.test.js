// Pruebas de integración para bloqueo de PIN (5 intentos / 60s),
// descubrimiento biométrico, registro/login WebAuthn con firma real P-256,
// y confirmación Step-Up de Administrador.

import crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { encodeCBOR } from "@levischuck/tiny-cbor";
import {
  api,
  login,
  getToken,
  auth,
  getStepUpToken,
  SEED_USERS,
} from "../helpers/api.js";
import { pool, resetDb, one, query } from "../helpers/db.js";

let adminToken;
let meseroToken;
let meseroId;
let adminId;

beforeAll(async () => {
  await resetDb();
  adminToken = await getToken("admin");
  meseroToken = await getToken("mesero");

  const adminRow = await one("SELECT id FROM users WHERE user_email = $1", [
    SEED_USERS.admin.email,
  ]);
  const meseroRow = await one("SELECT id FROM users WHERE user_email = $1", [
    SEED_USERS.mesero.email,
  ]);
  adminId = adminRow.id;
  meseroId = meseroRow.id;
});

afterAll(async () => {
  await pool.end();
});

function toBase64Url(input) {
  return Buffer.from(input).toString("base64url");
}

function createVirtualAuthenticator(rpId = "localhost", origin = "http://localhost:5173") {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
  });
  const jwk = publicKey.export({ format: "jwk" });
  const x = Buffer.from(jwk.x, "base64url");
  const y = Buffer.from(jwk.y, "base64url");

  const coseKey = encodeCBOR(
    new Map([
      [1, 2], // EC2
      [3, -7], // ES256
      [-1, 1], // P-256
      [-2, new Uint8Array(x)],
      [-3, new Uint8Array(y)],
    ])
  );

  const credentialIdBuf = crypto.randomBytes(32);
  const credentialId = toBase64Url(credentialIdBuf);
  const rpIdHash = crypto.createHash("sha256").update(rpId).digest();
  let signCount = 0;

  return {
    credentialId,
    buildRegistration(challenge) {
      const clientDataJSON = Buffer.from(
        JSON.stringify({
          type: "webauthn.create",
          challenge,
          origin,
          crossOrigin: false,
        })
      );

      const flags = Buffer.from([0x45]); // UP (0x01) + UV (0x04) + AT (0x40)
      const counterBuf = Buffer.alloc(4);
      counterBuf.writeUInt32BE(0, 0);
      const aaguid = Buffer.alloc(16, 0);
      const credLenBuf = Buffer.alloc(2);
      credLenBuf.writeUInt16BE(credentialIdBuf.length, 0);

      const authData = Buffer.concat([
        rpIdHash,
        flags,
        counterBuf,
        aaguid,
        credLenBuf,
        credentialIdBuf,
        Buffer.from(coseKey),
      ]);

      const attestationObject = encodeCBOR(
        new Map([
          ["fmt", "none"],
          ["attStmt", new Map()],
          ["authData", new Uint8Array(authData)],
        ])
      );

      return {
        id: credentialId,
        rawId: credentialId,
        type: "public-key",
        authenticatorAttachment: "platform",
        clientExtensionResults: {},
        response: {
          clientDataJSON: toBase64Url(clientDataJSON),
          attestationObject: toBase64Url(attestationObject),
          transports: ["internal"],
        },
      };
    },
    buildAssertion(challenge) {
      signCount += 1;
      const clientDataJSON = Buffer.from(
        JSON.stringify({
          type: "webauthn.get",
          challenge,
          origin,
          crossOrigin: false,
        })
      );

      const flags = Buffer.from([0x05]); // UP (0x01) + UV (0x04)
      const counterBuf = Buffer.alloc(4);
      counterBuf.writeUInt32BE(signCount, 0);
      const authenticatorData = Buffer.concat([rpIdHash, flags, counterBuf]);

      const clientDataHash = crypto.createHash("sha256").update(clientDataJSON).digest();
      const signedData = Buffer.concat([authenticatorData, clientDataHash]);
      const signature = crypto.sign("SHA256", signedData, privateKey);

      return {
        id: credentialId,
        rawId: credentialId,
        type: "public-key",
        authenticatorAttachment: "platform",
        clientExtensionResults: {},
        response: {
          clientDataJSON: toBase64Url(clientDataJSON),
          authenticatorData: toBase64Url(authenticatorData),
          signature: toBase64Url(signature),
        },
      };
    },
  };
}

describe("migración 0034: esquema de bloqueo PIN y biometría", () => {
  it("creó columnas pin_failed_attempts/pin_locked_until y tablas WebAuthn", async () => {
    const userCols = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name IN ('pin_failed_attempts', 'pin_locked_until')
    `);
    expect(userCols.rows.map((r) => r.column_name).sort()).toEqual([
      "pin_failed_attempts",
      "pin_locked_until",
    ]);

    const tables = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('user_biometric_credentials', 'webauthn_challenges')
    `);
    expect(tables.rows.map((r) => r.table_name).sort()).toEqual([
      "user_biometric_credentials",
      "webauthn_challenges",
    ]);
  });
});

describe("bloqueo por intentos fallidos de PIN (5 intentos / 60s)", () => {
  it("bloquea al 5to intento fallido y rechaza incluso el PIN correcto durante 60s", async () => {
    // 4 intentos fallidos → 401 con conteo descendente (4, 3, 2, 1)
    for (let i = 1; i <= 4; i++) {
      const failRes = await login({ userId: meseroId, pin: "9999" });
      expect(failRes.status).toBe(401);
      expect(failRes.body.code).toBe("INVALID_PIN");
      expect(failRes.body.attemptsRemaining).toBe(5 - i);
    }

    // 5to intento fallido → 429 PIN_LOCKED
    const fifthRes = await login({ userId: meseroId, pin: "9999" });
    expect(fifthRes.status).toBe(429);
    expect(fifthRes.body.code).toBe("PIN_LOCKED");
    expect(fifthRes.body.retryAfterSeconds).toBeGreaterThan(0);

    // Status público reporta isLocked=true
    const statusRes = await api.get(`/api/auth/webauthn/users/${meseroId}/status`);
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.isLocked).toBe(true);
    expect(statusRes.body.retryAfterSeconds).toBeGreaterThan(0);

    // Mientras esté bloqueado, incluso el PIN correcto es rechazado con 429
    const blockedValid = await login({ userId: meseroId, pin: SEED_USERS.mesero.pin });
    expect(blockedValid.status).toBe(429);
    expect(blockedValid.body.code).toBe("PIN_LOCKED");

    // Simular expiración de los 60 segundos en PostgreSQL → vuelve a aceptar y reinicia contador
    await query(
      `UPDATE users SET pin_locked_until = NOW() - INTERVAL '2 seconds' WHERE id = $1`,
      [meseroId]
    );

    const unlockedRes = await login({ userId: meseroId, pin: SEED_USERS.mesero.pin });
    expect(unlockedRes.status).toBe(200);
    expect(unlockedRes.body.token).toBeTruthy();

    const row = await one(
      "SELECT pin_failed_attempts, pin_locked_until FROM users WHERE id = $1",
      [meseroId]
    );
    expect(row.pin_failed_attempts).toBe(0);
    expect(row.pin_locked_until).toBeNull();
  });
});

describe("WebAuthn biométrico opcional: registro, login y multi-dispositivo", () => {
  it("cualquier rol registra su huella, inicia sesión por WebAuthn y la puede eliminar", async () => {
    const authenticator = createVirtualAuthenticator("localhost", "http://localhost:5173");

    // 1. Antes de registrar: sin biometría
    const preStatus = await api.get(`/api/auth/webauthn/users/${meseroId}/status`);
    expect(preStatus.status).toBe(200);
    expect(preStatus.body.hasBiometrics).toBe(false);

    // 2. Obtener opciones de registro autenticado como Mesero
    const regOptsRes = await api
      .post("/api/auth/webauthn/register/options")
      .set("Origin", "http://localhost:5173")
      .set(auth(meseroToken));
    expect(regOptsRes.status).toBe(200);
    expect(regOptsRes.body.options.challenge).toBeTruthy();

    const attestation = authenticator.buildRegistration(regOptsRes.body.options.challenge);

    // 3. Verificar y guardar credencial en PostgreSQL
    const regVerifyRes = await api
      .post("/api/auth/webauthn/register/verify")
      .set("Origin", "http://localhost:5173")
      .set(auth(meseroToken))
      .send({ response: attestation, deviceLabel: "Celular Mesero Prueba" });
    expect(regVerifyRes.status).toBe(201);
    expect(regVerifyRes.body.credential.deviceLabel).toBe("Celular Mesero Prueba");

    // 4. Reusar el mismo reto debe fallar (protección anti-replay)
    const replayReg = await api
      .post("/api/auth/webauthn/register/verify")
      .set("Origin", "http://localhost:5173")
      .set(auth(meseroToken))
      .send({ response: attestation });
    expect(replayReg.status).toBe(400);

    // 5. Status público del trabajador ya reporta hasBiometrics = true
    const postStatus = await api.get(`/api/auth/webauthn/users/${meseroId}/status`);
    expect(postStatus.status).toBe(200);
    expect(postStatus.body.hasBiometrics).toBe(true);
    expect(postStatus.body.credentialCount).toBe(1);

    // 6. Flujo de login biométrico para el mesero
    const loginOptsRes = await api
      .post("/api/auth/webauthn/login/options")
      .set("Origin", "http://localhost:5173")
      .send({ userId: meseroId });
    expect(loginOptsRes.status).toBe(200);

    const assertion = authenticator.buildAssertion(loginOptsRes.body.options.challenge);
    const loginVerifyRes = await api
      .post("/api/auth/webauthn/login/verify")
      .set("Origin", "http://localhost:5173")
      .send({ userId: meseroId, response: assertion });
    expect(loginVerifyRes.status).toBe(200);
    expect(loginVerifyRes.body.token).toBeTruthy();
    expect(loginVerifyRes.body.user.role).toBe("Mesero");

    // 7. Listar y revocar la credencial propia (y otro usuario NO puede borrarla)
    const listRes = await api
      .get("/api/auth/webauthn/credentials")
      .set(auth(meseroToken));
    expect(listRes.status).toBe(200);
    expect(listRes.body.credentials).toHaveLength(1);
    const credDbId = listRes.body.credentials[0].id;

    const foreignDelete = await api
      .delete(`/api/auth/webauthn/credentials/${credDbId}`)
      .set(auth(adminToken));
    expect(foreignDelete.status).toBe(404);

    const ownDelete = await api
      .delete(`/api/auth/webauthn/credentials/${credDbId}`)
      .set(auth(meseroToken));
    expect(ownDelete.status).toBe(200);

    const afterDeleteStatus = await api.get(`/api/auth/webauthn/users/${meseroId}/status`);
    expect(afterDeleteStatus.body.hasBiometrics).toBe(false);
  });
});

describe("Admin 2 pasos (email-check) + Step-Up Auth (huella o contraseña)", () => {
  it("email-check valida correo de administrador, estado de huella y rechaza inexistentes", async () => {
    const missing = await api
      .post("/api/auth/webauthn/login/email-check")
      .send({ email: "nadie@dpiero.com" });
    expect(missing.status).toBe(200);
    expect(missing.body.valid).toBe(false);

    const found = await api
      .post("/api/auth/webauthn/login/email-check")
      .send({ email: SEED_USERS.admin.email });
    expect(found.status).toBe(200);
    expect(found.body.valid).toBe(true);
    expect(found.body.hasBiometrics).toBe(false);
  });

  it("acciones críticas exigen X-Admin-Confirm-Token al Admin (huella O contraseña)", async () => {
    const adminAuth = createVirtualAuthenticator("localhost", "http://localhost:5173");

    // 1. Admin intenta crear usuario sin X-Admin-Confirm-Token → 403 STEP_UP_REQUIRED
    const blocked = await api
      .post("/api/users")
      .set(auth(adminToken))
      .send({
        userName: "Sin StepUp",
        userEmail: "sinstepup@dpiero.com",
        userDocumentNumber: "NO-STEPUP-1",
        userType: "mesero",
      });
    expect(blocked.status).toBe(403);
    expect(blocked.body.code).toBe("STEP_UP_REQUIRED");

    // 2. Step-up con contraseña incorrecta → 401
    const badPwd = await api
      .post("/api/auth/step-up/verify")
      .set(auth(adminToken))
      .send({ password: "clave-incorrecta" });
    expect(badPwd.status).toBe(401);

    // 3. Step-up con contraseña correcta (flujo PC sin lector) → token válido
    const stepUpToken = await getStepUpToken(adminToken);
    const createdWithPwd = await api
      .post("/api/users")
      .set({ ...auth(adminToken), "X-Admin-Confirm-Token": stepUpToken })
      .send({
        userName: "Con StepUp Password",
        userEmail: "constepup.pwd@dpiero.com",
        userDocumentNumber: "STEPUP-PWD-1",
        userType: "mesero",
        pin: "2222",
      });
    expect(createdWithPwd.status).toBe(201);

    // 4. Registrar huella del Admin y confirmar Step-Up por WebAuthn
    const regOpts = await api
      .post("/api/auth/webauthn/register/options")
      .set("Origin", "http://localhost:5173")
      .set(auth(adminToken));
    const att = adminAuth.buildRegistration(regOpts.body.options.challenge);
    const regSave = await api
      .post("/api/auth/webauthn/register/verify")
      .set("Origin", "http://localhost:5173")
      .set(auth(adminToken))
      .send({ response: att, deviceLabel: "iPhone Admin" });
    expect(regSave.status).toBe(201);

    const stepOpts = await api
      .post("/api/auth/step-up/options")
      .set("Origin", "http://localhost:5173")
      .set(auth(adminToken));
    expect(stepOpts.status).toBe(200);
    expect(stepOpts.body.hasBiometrics).toBe(true);

    const stepAssert = adminAuth.buildAssertion(stepOpts.body.options.challenge);
    const stepVerifyBio = await api
      .post("/api/auth/step-up/verify")
      .set("Origin", "http://localhost:5173")
      .set(auth(adminToken))
      .send({ response: stepAssert });
    expect(stepVerifyBio.status).toBe(200);
    expect(stepVerifyBio.body.method).toBe("biometric");
    expect(stepVerifyBio.body.stepUpToken).toBeTruthy();

    // 5. Cambiar permisos de grupo usando Step-Up biométrico y restaurar
    const { rows: groupRows } = await query(
      `SELECT group_id FROM groups WHERE group_name = 'Cocina'`
    );
    const cocinaGroupId = groupRows[0].group_id;
    const { rows: permRows } = await query(
      `SELECT permission_id FROM group_permissions WHERE group_id = $1`,
      [cocinaGroupId]
    );
    const cocinaPermIds = permRows.map((p) => p.permission_id);

    const updateGroupWithBio = await api
      .put(`/api/groups/${cocinaGroupId}/permissions`)
      .set({
        ...auth(adminToken),
        "X-Admin-Confirm-Token": stepVerifyBio.body.stepUpToken,
      })
      .send({ permissionIds: cocinaPermIds });
    expect(updateGroupWithBio.status).toBe(200);

    // 6. Token step-up adulterado o de usuario incorrecto → 403 STEP_UP_INVALID
    const badToken = await api
      .patch(`/api/users/${createdWithPwd.body.userID}/status`)
      .set({ ...auth(adminToken), "X-Admin-Confirm-Token": "invalid.jwt.token" })
      .send({ isActive: false });
    expect(badToken.status).toBe(403);
    expect(badToken.body.code).toBe("STEP_UP_INVALID");

    // Confirmar adminId en BD también tiene credencial
    const adminCreds = await api
      .get("/api/auth/webauthn/credentials")
      .set(auth(adminToken));
    expect(adminCreds.body.credentials[0].deviceLabel).toBe("iPhone Admin");
    expect(adminId).toBeTruthy();
  });
});

// Helpers de API: instancia Supertest + login por rol.
import request from "supertest";
import app from "../../src/app.js";

export const api = request(app);

export const SEED_USERS = {
  admin: { email: "admin@dpiero.com", password: "12345678" },
  mesero: { email: "carlos.mesero@dpiero.com", pin: "1234" },
  cajero: { email: "maria.caja@dpiero.com", pin: "1234" },
  cocina: { email: "ana.cocina@dpiero.com", pin: "1234" },
};

export async function login(payload) {
  return api.post("/api/auth/login").send(payload);
}

export async function getToken(role) {
  const creds = SEED_USERS[role];
  const res = await login(creds);
  if (res.status !== 200) {
    throw new Error(
      `No se pudo iniciar sesión como "${role}": HTTP ${res.status} ${JSON.stringify(res.body)}`
    );
  }
  return res.body.token;
}

export const auth = (token) => ({ Authorization: `Bearer ${token}` });

export async function getStepUpToken(adminToken, password = SEED_USERS.admin.password) {
  const res = await api
    .post("/api/auth/step-up/verify")
    .set(auth(adminToken))
    .send({ password });
  if (res.status !== 200 || !res.body?.stepUpToken) {
    throw new Error(
      `No se pudo obtener stepUpToken: HTTP ${res.status} ${JSON.stringify(res.body)}`
    );
  }
  return res.body.stepUpToken;
}

export async function stepUpAuth(adminToken, password = SEED_USERS.admin.password) {
  const stepUpToken = await getStepUpToken(adminToken, password);
  return {
    Authorization: `Bearer ${adminToken}`,
    "X-Admin-Confirm-Token": stepUpToken,
  };
}

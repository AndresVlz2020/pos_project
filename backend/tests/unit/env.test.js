// Tests unitarios de backend/src/config/env.js
// NO requieren base de datos.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateEnv, getJWTSecret, getJWTExpires } from "../../src/config/env.js";

const KEYS = ["JWT_SECRET", "DB_USER", "DB_NAME", "JWT_EXPIRES"];
const SNAPSHOT = {};

beforeEach(() => {
  for (const key of KEYS) SNAPSHOT[key] = process.env[key];
});

afterEach(() => {
  for (const key of KEYS) {
    if (SNAPSHOT[key] === undefined) delete process.env[key];
    else process.env[key] = SNAPSHOT[key];
  }
});

describe("validateEnv", () => {
  it("valida una configuración completa y secreto fuerte", () => {
    expect(validateEnv()).toBe(true);
  });

  it("lanza error si falta DB_USER", () => {
    delete process.env.DB_USER;
    expect(() => validateEnv()).toThrow(/Configuración incompleta/);
  });

  it("lanza error si falta JWT_SECRET", () => {
    delete process.env.JWT_SECRET;
    expect(() => validateEnv()).toThrow(/JWT_SECRET/);
  });

  it("lanza error si JWT_SECRET es menor a 24 caracteres", () => {
    process.env.JWT_SECRET = "corto";
    expect(() => validateEnv()).toThrow(/demasiado corto/);
  });
});

describe("getJWTSecret", () => {
  it("devuelve el secreto configurado", () => {
    process.env.JWT_SECRET = "un-secreto-de-prueba-suficientemente-largo";
    expect(getJWTSecret()).toBe("un-secreto-de-prueba-suficientemente-largo");
  });

  it("lanza error si JWT_SECRET no está configurado", () => {
    delete process.env.JWT_SECRET;
    expect(() => getJWTSecret()).toThrow(/JWT_SECRET/);
  });
});

describe("getJWTExpires", () => {
  it("devuelve '1h' por defecto", () => {
    delete process.env.JWT_EXPIRES;
    expect(getJWTExpires()).toBe("1h");
  });

  it("respeta JWT_EXPIRES personalizado", () => {
    process.env.JWT_EXPIRES = "30m";
    expect(getJWTExpires()).toBe("30m");
  });
});

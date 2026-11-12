// Configuración de Vitest para el backend del POS.
// - environment node: probamos la API Express con Supertest (sin DOM).
// - fileParallelism false: todas las suites comparten UNA sola BD de prueba
//   (pos_project_test); correrlas en paralelo produciría interferencias.
// - setupFiles: fuerza el entorno de prueba ANTES de importar la app
//   (BD de prueba, sin SMTP real, NODE_ENV=test).
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    // 1) Se ejecuta UNA vez antes de todo: crea y migra la BD de prueba.
    globalSetup: ["./tests/global-setup.js"],
    // 2) Se ejecuta antes de cada archivo: fija variables de entorno de prueba.
    setupFiles: ["./tests/setup-env.js"],
    // Todas las suites comparten UNA sola BD (pos_project_test): se ejecutan en serie.
    fileParallelism: false,
    pool: "forks",
    // Silenciar el console.log de la app en las pruebas que pasan (menos ruido).
    silent: "passed-only",
    testTimeout: 20000,
    hookTimeout: 120000,
  },
});

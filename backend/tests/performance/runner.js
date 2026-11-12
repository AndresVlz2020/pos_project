// backend/tests/performance/runner.js
// Suite de pruebas de rendimiento (Carga, Estrés, Picos, Resistencia, Concurrencia y Volumen)
// diseñada específicamente para los endpoints del POS D'Piero.
//
// Uso:
//   node tests/performance/runner.js --mode=all
//   node tests/performance/runner.js --mode=load --duration=10 --vus=25
//   node tests/performance/runner.js --mode=stress
//   node tests/performance/runner.js --mode=spike
//   node tests/performance/runner.js --mode=soak --duration=30
//   node tests/performance/runner.js --mode=concurrency
//   node tests/performance/runner.js --mode=volume

import { spawn } from "node:child_process";
import { performance } from "node:perf_hooks";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [k, v] = arg.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  })
);

const MODE = args.mode || "all";
const DEFAULT_DURATION_SEC = Number(args.duration || 8);
const DEFAULT_VUS = Number(args.vus || 25);
const EXPLICIT_URL = args.url || process.env.PERF_BASE_URL || "";

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

function summarize(name, latenciesMs, statusCounts, durationMs) {
  const sorted = [...latenciesMs].sort((a, b) => a - b);
  const total = latenciesMs.length;
  const ok = Object.entries(statusCounts)
    .filter(([code]) => Number(code) >= 200 && Number(code) < 400)
    .reduce((acc, [, count]) => acc + count, 0);
  const errors = total - ok;
  const rps = durationMs > 0 ? (total / (durationMs / 1000)).toFixed(1) : "0.0";
  const avg = total > 0 ? latenciesMs.reduce((a, b) => a + b, 0) / total : 0;

  return {
    prueba: name,
    peticiones: total,
    rps: Number(rps),
    ok,
    errores: errors,
    tasaError: total > 0 ? `${((errors / total) * 100).toFixed(2)}%` : "0.00%",
    avgMs: Number(avg.toFixed(1)),
    p50Ms: Number(percentile(sorted, 50).toFixed(1)),
    p95Ms: Number(percentile(sorted, 95).toFixed(1)),
    p99Ms: Number(percentile(sorted, 99).toFixed(1)),
    maxMs: Number((sorted[sorted.length - 1] || 0).toFixed(1)),
    codigos: statusCounts,
  };
}

async function isServerAlive(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/api/products`, {
      signal: AbortSignal.timeout(1500),
    });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

async function ensureTargetServer() {
  if (EXPLICIT_URL) {
    return { baseUrl: EXPLICIT_URL, child: null };
  }

  const defaultUrl = "http://127.0.0.1:4000";
  if (await isServerAlive(defaultUrl)) {
    return { baseUrl: defaultUrl, child: null };
  }

  const testPort = "4099";
  const spawnedUrl = `http://127.0.0.1:${testPort}`;
  console.log(`🚀 Iniciando servidor backend temporal en ${spawnedUrl} para las pruebas...`);

  const child = spawn(process.execPath, ["src/server.js"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: testPort },
    stdio: ["ignore", "ignore", "pipe"],
  });
  child.stderr.on("data", () => {});

  for (let i = 0; i < 30; i++) {
    if (await isServerAlive(spawnedUrl)) {
      return { baseUrl: spawnedUrl, child };
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  child.kill();
  throw new Error("No se pudo iniciar el servidor backend temporal para las pruebas.");
}

async function buildAuthHeader(baseUrl) {
  try {
    const usersRes = await fetch(`${baseUrl}/api/users?active=true`);
    const users = usersRes.ok ? await usersRes.json() : [];
    const adminUser =
      users.find((u) => (u.role || u.userType || "").toLowerCase().includes("admin")) ||
      users[0];

    if (adminUser && process.env.JWT_SECRET) {
      const token = jwt.sign(
        {
          id: adminUser.id,
          email: adminUser.userEmail || adminUser.email,
          role: adminUser.role || "Administrador",
          isAdmin: true,
          isSuperuser: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // Fallback sin token para rutas públicas
  }
  return {};
}

async function hitEndpoint(baseUrl, endpoint, headers = {}) {
  const t0 = performance.now();
  let status = "ERR";
  try {
    const res = await fetch(`${baseUrl}${endpoint.path}`, {
      method: endpoint.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
      signal: AbortSignal.timeout(8000),
    });
    await res.arrayBuffer();
    status = String(res.status);
  } catch {
    status = "TIMEOUT_OR_NET";
  }
  const elapsed = performance.now() - t0;
  return { status, elapsed };
}

async function runStage({ name, baseUrl, headers, endpoints, vus, durationSec }) {
  const latencies = [];
  const statusCounts = {};
  const endAt = performance.now() + durationSec * 1000;
  const tStart = performance.now();

  const workers = Array.from({ length: vus }, async (_, workerIdx) => {
    let i = workerIdx;
    while (performance.now() < endAt) {
      const ep = endpoints[i % endpoints.length];
      i++;
      const { status, elapsed } = await hitEndpoint(baseUrl, ep, headers);
      latencies.push(elapsed);
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }
  });

  await Promise.all(workers);
  return summarize(name, latencies, statusCounts, performance.now() - tStart);
}

async function runLoadTest(baseUrl, headers, endpoints) {
  console.log(`\n📊 [1/6] Prueba de CARGA (${DEFAULT_VUS} terminales POS durante ${DEFAULT_DURATION_SEC}s)...`);
  return [
    await runStage({
      name: `Carga (${DEFAULT_VUS} VUs / ${DEFAULT_DURATION_SEC}s)`,
      baseUrl,
      headers,
      endpoints,
      vus: DEFAULT_VUS,
      durationSec: DEFAULT_DURATION_SEC,
    }),
  ];
}

async function runStressTest(baseUrl, headers, endpoints) {
  console.log("\n🔥 [2/6] Prueba de ESTRÉS (escalado progresivo 20 → 50 → 100 → 150 VUs)...");
  const steps = [20, 50, 100, 150];
  const results = [];
  for (const vus of steps) {
    results.push(
      await runStage({
        name: `Estrés (${vus} VUs / 4s)`,
        baseUrl,
        headers,
        endpoints,
        vus,
        durationSec: 4,
      })
    );
  }
  return results;
}

async function runSpikeTest(baseUrl, headers, endpoints) {
  console.log("\n⚡ [3/6] Prueba de PICOS (10 VUs → ráfaga súbita 120 VUs → 10 VUs)...");
  return [
    await runStage({
      name: "Pico - Base (10 VUs / 3s)",
      baseUrl,
      headers,
      endpoints,
      vus: 10,
      durationSec: 3,
    }),
    await runStage({
      name: "Pico - Ráfaga (120 VUs / 4s)",
      baseUrl,
      headers,
      endpoints,
      vus: 120,
      durationSec: 4,
    }),
    await runStage({
      name: "Pico - Recuperación (10 VUs / 3s)",
      baseUrl,
      headers,
      endpoints,
      vus: 10,
      durationSec: 3,
    }),
  ];
}

async function runSoakTest(baseUrl, headers, endpoints) {
  const soakSec = Math.max(DEFAULT_DURATION_SEC, 15);
  console.log(`\n⏱️ [4/6] Prueba de RESISTENCIA / SOAK (20 VUs sostenidos durante ${soakSec}s)...`);
  const memBefore = process.memoryUsage().rss / (1024 * 1024);
  const res = await runStage({
    name: `Resistencia (20 VUs / ${soakSec}s)`,
    baseUrl,
    headers,
    endpoints,
    vus: 20,
    durationSec: soakSec,
  });
  const memAfter = process.memoryUsage().rss / (1024 * 1024);
  console.log(`   Memoria cliente RSS: inicio ${memBefore.toFixed(1)} MB → fin ${memAfter.toFixed(1)} MB`);
  return [res];
}

async function runConcurrencyTest(baseUrl, headers) {
  console.log("\n🔀 [5/6] Prueba de CONCURRENCIA (50 peticiones simultáneas en el mismo milisegundo)...");
  const targets = [
    { method: "GET", path: "/api/orders/tables/availability" },
    { method: "GET", path: "/api/access/check/create_order" },
    { method: "GET", path: "/api/users?active=true" },
    { method: "GET", path: "/api/inventory" },
    { method: "GET", path: "/api/orders" },
  ];

  const tStart = performance.now();
  const batch = Array.from({ length: 50 }, (_, idx) =>
    hitEndpoint(baseUrl, targets[idx % targets.length], headers)
  );
  const responses = await Promise.all(batch);
  const latencies = responses.map((r) => r.elapsed);
  const statusCounts = responses.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return [
    summarize(
      "Concurrencia (50 peticiones en ráfaga simultánea)",
      latencies,
      statusCounts,
      performance.now() - tStart
    ),
  ];
}

async function runVolumeTest(baseUrl, headers) {
  console.log("\n📦 [6/6] Prueba de VOLUMEN (consultas de listados completos y catálogos)...");
  const volumeEndpoints = [
    { method: "GET", path: "/api/orders" },
    { method: "GET", path: "/api/products" },
    { method: "GET", path: "/api/inventory" },
    { method: "GET", path: "/api/users" },
    { method: "GET", path: "/api/suppliers" },
  ];

  const latencies = [];
  const statusCounts = {};
  const tStart = performance.now();

  for (let round = 0; round < 10; round++) {
    for (const ep of volumeEndpoints) {
      const { status, elapsed } = await hitEndpoint(baseUrl, ep, headers);
      latencies.push(elapsed);
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }
  }

  return [
    summarize(
      "Volumen (50 consultas completas de catálogos/tablas)",
      latencies,
      statusCounts,
      performance.now() - tStart
    ),
  ];
}

async function main() {
  const { baseUrl, child } = await ensureTargetServer();
  try {
    const headers = await buildAuthHeader(baseUrl);
    const posEndpoints = [
      { method: "GET", path: "/api/products" },
      { method: "GET", path: "/api/orders" },
      { method: "GET", path: "/api/orders/tables/availability" },
      { method: "GET", path: "/api/inventory" },
      { method: "GET", path: "/api/users?active=true" },
      { method: "GET", path: "/api/access/check/create_order" },
    ];

    console.log(`\n🎯 Objetivo: ${baseUrl} | Modo: ${MODE}`);
    const report = [];

    if (MODE === "load" || MODE === "all") {
      report.push(...(await runLoadTest(baseUrl, headers, posEndpoints)));
    }
    if (MODE === "stress" || MODE === "all") {
      report.push(...(await runStressTest(baseUrl, headers, posEndpoints)));
    }
    if (MODE === "spike" || MODE === "all") {
      report.push(...(await runSpikeTest(baseUrl, headers, posEndpoints)));
    }
    if (MODE === "soak" || MODE === "all") {
      report.push(...(await runSoakTest(baseUrl, headers, posEndpoints)));
    }
    if (MODE === "concurrency" || MODE === "all") {
      report.push(...(await runConcurrencyTest(baseUrl, headers)));
    }
    if (MODE === "volume" || MODE === "all") {
      report.push(...(await runVolumeTest(baseUrl, headers)));
    }

    console.log("\n================== RESUMEN DE RENDIMIENTO POS ==================");
    console.table(
      report.map((r) => ({
        Prueba: r.prueba,
        Peticiones: r.peticiones,
        RPS: r.rps,
        "Error %": r.tasaError,
        "Avg (ms)": r.avgMs,
        "p50 (ms)": r.p50Ms,
        "p95 (ms)": r.p95Ms,
        "p99 (ms)": r.p99Ms,
        "Max (ms)": r.maxMs,
      }))
    );

    const hasFailures = report.some((r) => r.errores > 0);
    if (hasFailures) {
      console.log("⚠️ Detalle de códigos recibidos:", report.filter((r) => r.errores > 0));
      process.exitCode = 1;
    } else {
      console.log("✅ Todas las pruebas finalizaron con 0% de errores.");
    }
  } finally {
    if (child) {
      child.kill();
    }
  }
}

main().catch((err) => {
  console.error("❌ Error en suite de rendimiento:", err);
  process.exit(1);
});

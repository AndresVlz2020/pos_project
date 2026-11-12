// backend/tests/performance/k6-pos-suite.js
// Script listo para ejecutar con k6 (https://k6.io):
//   k6 run -e BASE_URL=http://localhost:4000 tests/performance/k6-pos-suite.js

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:4000";

export const options = {
  scenarios: {
    // 1. Carga normal/pico de restaurante (meseros + cocina + caja)
    carga_operacion: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "20s", target: 25 },
        { duration: "1m", target: 25 },
        { duration: "15s", target: 0 },
      ],
    },
    // 2. Pico súbito (cambio de turno / hora pico)
    pico_hora_almuerzo: {
      executor: "ramping-vus",
      startTime: "1m40s",
      startVUs: 5,
      stages: [
        { duration: "5s", target: 100 },
        { duration: "15s", target: 100 },
        { duration: "10s", target: 5 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"], // Menos de 1% de errores
    http_req_duration: ["p(95)<400", "p(99)<800"], // 95% < 400ms
  },
};

export default function () {
  const responses = http.batch([
    ["GET", `${BASE_URL}/api/products`],
    ["GET", `${BASE_URL}/api/orders`],
    ["GET", `${BASE_URL}/api/orders/tables/availability`],
    ["GET", `${BASE_URL}/api/inventory`],
    ["GET", `${BASE_URL}/api/users?active=true`],
  ]);

  responses.forEach((res) => {
    check(res, {
      "status < 400": (r) => r.status >= 200 && r.status < 400,
    });
  });

  sleep(0.5);
}

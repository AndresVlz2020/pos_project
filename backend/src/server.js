import { validateEnv, NODE_ENV } from "./config/env.js";
import app from "./app.js";

// Fallar rápido si falta algún secreto crítico — nunca operar con valores por defecto
validateEnv();
console.log(`[env] NODE_ENV=${NODE_ENV} — configuración validada`);

// Prevención de caídas del proceso Node ante excepciones no capturadas
process.on("uncaughtException", (err) => {
  console.error("⚠️ [CRITICAL GUARD] Excepción no capturada evitada:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("⚠️ [CRITICAL GUARD] Promesa rechazada evitada:", reason);
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

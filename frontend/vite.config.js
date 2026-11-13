import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Crear __dirname compatible con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor-react",
              test: /node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            },
            {
              name: "vendor-table",
              test: /node_modules[\\/]@tanstack[\\/]/,
            },
            {
              name: "vendor-ui",
              test: /node_modules[\\/](lucide-react|sweetalert2)[\\/]/,
            },
          ],
        },
      },
    },
  },
});

import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const basePath = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/")) {
            return "vendor-react";
          }

          if (id.includes("/lucide-react/")) {
            return "vendor-icons";
          }

          if (id.includes("/recharts/") || id.includes("/d3-") || id.includes("/victory-vendor/")) {
            return "vendor-charts";
          }

          if (id.includes("/@radix-ui/")) {
            return "vendor-radix";
          }

          if (id.includes("/zod/")) {
            return "vendor-validation";
          }

          return "vendor";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    css: true,
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**", "storybook-static/**"],
  },
});

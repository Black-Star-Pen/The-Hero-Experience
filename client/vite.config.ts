import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// The API runs on port 3310 during development. Proxying /api keeps the
// client and the API on the same origin, like in production: no CORS and
// SameSite session cookies just work.
// The Host header is kept (the shorthand `"/api": target` would rewrite it):
// the API compares it with the Origin header to block cross-site requests.
const apiProxy = {
  "/api": {
    target: process.env.API_PROXY_TARGET ?? "http://localhost:3310",
    changeOrigin: false,
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: apiProxy,
  },
  preview: {
    port: 4173,
    proxy: apiProxy,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
});

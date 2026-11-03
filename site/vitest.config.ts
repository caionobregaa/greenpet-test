import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    css: false,
    pool: "threads",
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/components/**", "src/app/imagens/**"],
      thresholds: { lines: 90, functions: 90, branches: 85 },
    },
  },
});

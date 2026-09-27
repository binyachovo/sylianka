import { defineConfig } from "vitest/config";

// Тести логіки (геометрія, друк смугами, перевірка даних) — без браузера й без PWA-плагіна.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node"
  }
});

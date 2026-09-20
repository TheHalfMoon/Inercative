import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["apps/control-plane/**/*.test.js"],
    environment: "node",
  },
});

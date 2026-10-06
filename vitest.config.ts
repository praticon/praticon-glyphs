import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/*/test/**/*.test.ts", "scripts/**/*.test.ts", "site/src/**/*.test.ts"],
    // The site reads Vite's BASE_URL; tests render it from the root.
    env: { BASE_URL: "/" },
  },
});

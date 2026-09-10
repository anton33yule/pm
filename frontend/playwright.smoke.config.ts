import { defineConfig, devices } from "@playwright/test";

// Smoke-tests the real FastAPI-served static export (see docs/PLAN.md Part 3).
// Unlike playwright.config.ts, this does not manage a dev server — start the
// backend first (e.g. `scripts/start`) against http://127.0.0.1:8000.
export default defineConfig({
  testDir: "./tests-smoke",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:8000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

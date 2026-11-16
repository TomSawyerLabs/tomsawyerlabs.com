import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

// PORT lets a run avoid a dev server some other project already has on 5173.
// Also emptied by tests/global-setup.ts at the start of every run.
const REVIEW_TEST_DIR = join(tmpdir(), "tsl-review-tests");

const port = Number(process.env.PORT ?? 5173);

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: `bun run dev --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    // Review comments from the tests go to a scratch folder, never to
    // review/comments.json or the webhook.
    env: { REVIEW_DIR: REVIEW_TEST_DIR },
  },
});

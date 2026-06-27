import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — minimal happy-path E2E setup.
 *
 * - One project: chromium using the system Chrome (no `npx
 *   playwright install` needed; falls back to the installed browser
 *   in `Program Files` on Windows).
 * - `webServer` boots the Vite dev server on a unique port so
 *   `bun run test:e2e` is a one-liner.
 * - Tests live in `e2e/`. Add more flows as needed.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // one test, no benefit from parallelism
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use the system-installed Chrome so we don't need to
        // download Playwright's bundled browser (saves ~150MB).
        launchOptions: { channel: 'chrome' },
      },
    },
  ],
  webServer: {
    command: 'bun run dev --port 5174',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});

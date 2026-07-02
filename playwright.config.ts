import { defineConfig, devices } from '@playwright/test';

/**
 * Config for the m4to.com live-site E2E suite.
 *
 * This exercises the real production site at https://m4to.com, not a local
 * dev server, so:
 *  - workers is pinned to 1 to avoid hammering a personal site with
 *    concurrent traffic.
 *  - timeouts are generous to tolerate real-world network/hosting latency.
 *  - assertions prefer auto-retrying `expect(locator).toBeVisible()` over
 *    `networkidle`/`waitForTimeout`, since this is a client-rendered SPA
 *    that keeps background activity (fonts, analytics) going after load.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [['list']],
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: 'https://m4to.com',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

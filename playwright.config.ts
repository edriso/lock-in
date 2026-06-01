import { defineConfig, devices } from '@playwright/test';

/*
 * Playwright drives the real app in a browser. Because Linger is frontend-only,
 * the config starts the dev server for you, no database or API needed.
 * Run `pnpm test:e2e:install` once to download the browser.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});

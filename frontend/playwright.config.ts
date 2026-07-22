import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 30_000,
  testDir: 'tests-e2e',
  use: {
    baseURL: process.env.VITE_API_URL ? process.env.VITE_API_URL.replace('/api','') : 'http://localhost:5173',
    headless: true,
    // Use local Chrome if Playwright cannot download browsers in this environment
    channel: process.env.PW_USE_SYSTEM_CHROME ? 'chrome' : undefined,
    ignoreHTTPSErrors: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});

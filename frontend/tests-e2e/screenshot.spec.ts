import { test } from '@playwright/test';
import fs from 'fs';

test('capture login page screenshot', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const out = 'test-results/login-screenshot-chromium.png';
  await page.screenshot({ path: out, fullPage: true });
  // ensure results dir exists
  if (!fs.existsSync('test-results')) fs.mkdirSync('test-results');
});

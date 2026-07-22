import { test, expect } from '@playwright/test';

test('full login flow and view lawyers', async ({ page, request }) => {
  // Create user via backend API using node fetch to avoid APIContext edge cases
  const email = `e2e+${Date.now()}@example.com`;
  const pw = 'e2epw';
  const reg = await fetch('http://localhost:4000/api/auth/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'E2E', email, password: pw, role: 'admin' }) });
  const loginResp = await fetch('http://localhost:4000/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: pw }) });
  const body = await loginResp.json();
  const token = body.token;

  // Navigate to frontend app
  const frontendBase = process.env.VITE_API_URL ? process.env.VITE_API_URL.replace('/api','') : 'http://localhost:5173';
  await page.goto(frontendBase);

  // Fill login form (email input has no type attribute)
  await page.locator('input').first().fill(email);
  await page.fill('input[type="password"]', pw);
  // await page.click('text=Entrar');
  await page.getByRole('button', { name: /entrar/i }).click();

  // Expect admin dashboard visible
  await expect(page.locator('text=Administrador')).toBeVisible({ timeout: 5000 });
  // Try fetching lawyers via UI list
  await expect(page.locator('text=Gestión de abogados')).toBeVisible();
});

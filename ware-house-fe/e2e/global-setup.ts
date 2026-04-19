import fs from 'node:fs';
import path from 'node:path';
import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const projectUse = config.projects[0]?.use || {};
  const baseURL = String(projectUse.baseURL || process.env.E2E_BASE_URL || 'http://localhost:5173');

  const storageStatePath = path.resolve(process.cwd(), 'e2e/.auth/admin.json');
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });

  const email = process.env.E2E_EMAIL || 'admin@gmail.com';
  const password = process.env.E2E_PASSWORD || 'admin123';

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);

    const permissionsResponse = page.waitForResponse((response) => {
      return response.url().includes('/users/me/permissions') && response.status() === 200;
    });

    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    await page.waitForURL('**/dashboard', { timeout: 20_000 });
    await permissionsResponse;
    await page.getByRole('heading', { name: 'Tổng quan Kho hàng' }).waitFor({ timeout: 20_000 });

    await page.context().storageState({ path: storageStatePath });
  } finally {
    await browser.close();
  }
}

export default globalSetup;

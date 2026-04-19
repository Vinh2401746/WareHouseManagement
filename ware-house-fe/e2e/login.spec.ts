import { test, expect } from '@playwright/test';

test.describe('Login page (public)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('shows login form', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Quản Trị Kho' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeVisible();
  });
});

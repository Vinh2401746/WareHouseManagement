import { test, expect } from '@playwright/test';

test.describe('Smoke (authenticated)', () => {
  test('dashboard loads', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Tổng quan Kho hàng' })).toBeVisible();
  });

  test('supplier page loads', async ({ page }) => {
    await page.goto('/supplier');

    await expect(page.getByText('Nhà cung cấp')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thêm nhà cung cấp' })).toBeVisible();
  });
});

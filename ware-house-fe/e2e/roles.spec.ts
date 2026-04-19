import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const apiBaseURL = process.env.E2E_API_BASE_URL || 'http://localhost:3000/v1';
const adminEmail = process.env.E2E_EMAIL || 'admin@gmail.com';
const adminPassword = process.env.E2E_PASSWORD || 'admin123';

type CreatedUser = {
  email: string;
  password: string;
  name: string;
};

async function getAdminAccessToken(request: APIRequestContext): Promise<string> {
  const response = await request.post(`${apiBaseURL}/auth/login`, {
    data: {
      email: adminEmail,
      password: adminPassword,
    },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  const token = body?.tokens?.access?.token;
  expect(typeof token).toBe('string');
  return token;
}

async function ensureBranchId(request: APIRequestContext, accessToken: string): Promise<string> {
  const listResponse = await request.get(`${apiBaseURL}/branch?limit=1&page=1`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  expect(listResponse.ok()).toBeTruthy();
  const listBody = await listResponse.json();
  const firstBranch = Array.isArray(listBody?.results) ? listBody.results[0] : null;

  const branchId = firstBranch?.id || firstBranch?._id;
  if (branchId) {
    return branchId;
  }

  const createResponse = await request.post(`${apiBaseURL}/branch`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      name: `E2E Branch ${Date.now()}`,
      address: 'E2E',
      phone: '0000000000',
    },
  });

  expect(createResponse.ok()).toBeTruthy();
  const created = await createResponse.json();
  const createdId = created?.id || created?._id;
  expect(typeof createdId).toBe('string');
  return createdId;
}

async function createUserWithRole(
  request: APIRequestContext,
  roleKey: string,
): Promise<CreatedUser> {
  const accessToken = await getAdminAccessToken(request);
  const branchId = await ensureBranchId(request, accessToken);

  const user: CreatedUser = {
    email: `e2e-${roleKey}-${Date.now()}@example.com`,
    password: 'Test123!@#',
    name: `E2E ${roleKey}`,
  };

  const createResponse = await request.post(`${apiBaseURL}/users`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      ...user,
      branch: branchId,
      roleKey,
    },
  });

  if (!createResponse.ok()) {
    throw new Error(
      `Create user failed (${createResponse.status()}): ${await createResponse.text()}`,
    );
  }
  return user;
}

async function loginViaUi(page: Page, email: string, password: string) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);

  const permissionsResponse = page.waitForResponse((response) => {
    return response.url().includes('/users/me/permissions') && response.status() === 200;
  });

  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  await page.waitForURL('**/dashboard', { timeout: 20_000 });
  await permissionsResponse;
}

test('superadmin can view and manage suppliers', async ({ page }) => {
  await page.goto('/supplier');

  await expect(page.getByRole('button', { name: 'Thêm nhà cung cấp' })).toBeEnabled();
});

test.describe('supplier access by role', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('warehouse_staff can view but not manage suppliers', async ({ page, request }) => {
    const staffUser = await createUserWithRole(request, 'warehouseStaff');

    await loginViaUi(page, staffUser.email, staffUser.password);

    await page.goto('/supplier');

    await expect(page.getByRole('button', { name: 'Thêm nhà cung cấp' })).toBeDisabled();
  });

  test('user without suppliers permission sees no-permission page', async ({ page, request }) => {
    const limitedUser = await createUserWithRole(request, 'user');

    await loginViaUi(page, limitedUser.email, limitedUser.password);

    await page.goto('/supplier');

    await expect(page.getByText('Bạn không có quyền thao thác chức năng này')).toBeVisible();
  });
});

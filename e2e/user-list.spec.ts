import { test, expect } from '@playwright/test';

test.describe('User List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
  });

  test('should display the page title', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const heading = await page.getByRole('heading', { level: 1 }).textContent();
    expect(heading).toMatch(/Gestión de Usuarios|User Management/);
  });

  test('should render the data table with users', async ({ page }) => {
    const table = page.getByRole('table', { name: /usuarios|users/i });
    await expect(table).toBeVisible();
    // Wait for at least one data row (skeleton -> real data)
    await expect(page.locator('.p-datatable-tbody tr').first()).toBeVisible({ timeout: 10_000 });
  });

  test('should filter users by search input', async ({ page }) => {
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('Emily');
    // Table re-renders after debounce (400ms) + network
    await page.waitForTimeout(600);
    await expect(page.locator('.p-datatable-tbody tr')).not.toHaveCount(0);
  });

  test('should navigate to new user form when clicking "Nuevo usuario"', async ({ page }) => {
    await page.getByRole('button', { name: /nuevo usuario|new user/i }).click();
    await expect(page).toHaveURL(/\/users\/new/);
  });
});

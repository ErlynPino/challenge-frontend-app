import { test, expect } from '@playwright/test';

test.describe('User Form — Create', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users/new');
  });

  test('should display create form with correct title', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text).toMatch(/Nuevo usuario|New user/);
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /crear usuario|create user/i }).click();
    const errors = page.locator('[role="alert"]');
    await expect(errors.first()).toBeVisible();
  });

  test('should navigate back when clicking cancel', async ({ page }) => {
    await page.getByRole('button', { name: /cancelar|cancel/i }).click();
    await expect(page).toHaveURL(/\/users/);
  });
});

test.describe('User Form — Accessibility', () => {
  test('should have accessible form labels and aria attributes', async ({ page }) => {
    await page.goto('/users/new');

    const usernameInput = page.locator('#username');
    await expect(usernameInput).toHaveAttribute('aria-required', 'true');

    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveAttribute('aria-required', 'true');
  });
});

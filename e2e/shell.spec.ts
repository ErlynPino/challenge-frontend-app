import { test, expect } from '@playwright/test';

test.describe('Shell — Navigation', () => {
  test('should redirect from / to /users', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/users/);
  });

  test('should display app header with nav link', async ({ page }) => {
    await page.goto('/users');
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    await expect(header.getByRole('link', { name: /usuarios|users/i })).toBeVisible();
  });

  test('should have a working skip navigation link', async ({ page }) => {
    await page.goto('/users');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('should toggle dark mode class on html element', async ({ page }) => {
    await page.goto('/users');
    const toggleBtn = page.locator('.app-nav__theme-toggle').last();
    await toggleBtn.click();
    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains('app-dark'),
    );
    expect(isDark).toBe(true);
    // Toggle back
    await toggleBtn.click();
    const isLight = await page.evaluate(
      () => !document.documentElement.classList.contains('app-dark'),
    );
    expect(isLight).toBe(true);
  });

  test('should switch language between ES and EN', async ({ page }) => {
    await page.goto('/users');
    // First button in nav is lang toggle
    const langToggle = page.locator('.app-nav__theme-toggle').first();
    const before = await langToggle.textContent();
    await langToggle.click();
    const after = await langToggle.textContent();
    expect(before?.trim()).not.toBe(after?.trim());
  });
});

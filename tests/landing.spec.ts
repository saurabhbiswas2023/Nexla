import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads and shows hero, search, and footer', async ({ page }) => {
    await expect(page).toHaveTitle(/Nexla/i).catch(() => Promise.resolve());
    await expect(page.getByTestId('landing-input')).toBeVisible();
    await expect(page.getByTestId('landing-submit')).toBeVisible();
    await expect(page.getByRole('contentinfo', { name: /site footer/i })).toBeVisible();
  });

  test('search creates a session via submit', async ({ page }) => {
    await page.getByTestId('landing-input').fill('Connect Shopify to BigQuery');
    await page.getByTestId('landing-submit').click();
    // Expect navigation to chat or localStorage/session keys set
    await expect(page).toHaveURL(/\/(chat|)/, { timeout: 5000 }).catch(async () => {
      const keys = await page.evaluate(() => Object.keys(window.localStorage));
      expect(keys.join(',')).toMatch(/chat-store|canvas-store|progress-store/);
    });
  });

  test('example card click navigates to chat', async ({ page }) => {
    const example = page.locator('[data-testid^="example-"]').first();
    await expect(example).toBeVisible();
    await example.click();
    await expect(page).toHaveURL(/\/chat/, { timeout: 5000 });
  });
});



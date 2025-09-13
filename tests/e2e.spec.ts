import { test, expect } from '@playwright/test';

test.describe('Nexla UI', () => {
  test('landing loads and navigates to chat', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Nexla' })).toBeVisible();
    await page.getByRole('link', { name: 'Start' }).click();
    await expect(page.getByText('Flow Canvas')).toBeVisible();
  });

  test('example prompt flows into chat', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Connect Shopify to BigQuery').click();
    await expect(page.getByText('Great example')).toBeVisible();
  });
});

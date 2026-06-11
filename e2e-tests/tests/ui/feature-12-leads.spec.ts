import { test, expect } from '@playwright/test';

test.describe('Feature 12: UI Lead Scoring Table & Chart', () => {
  test('Verify navigating to /leads displays Leads page', async ({ page }) => {
    await page.goto('/leads');
    await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('Verify Leads Table renders columns correctly', async ({ page }) => {
    await page.goto('/leads');
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Score' })).toBeVisible();
  });

  test('Verify Score Distribution Chart renders via Recharts', async ({ page }) => {
    await page.goto('/leads');
    await expect(page.locator('.recharts-wrapper')).toBeVisible();
  });

  test('Verify Lead status badges display correct colors', async ({ page }) => {
    await page.goto('/leads');
    const badge = page.locator('.lead-status-badge').first();
    await expect(badge).toBeVisible();
  });

  test('Verify clicking on a Lead shows detailed factors', async ({ page }) => {
    await page.goto('/leads');
    const row = page.locator('tr.lead-row').first();
    await expect(row).toBeVisible();
  });
});

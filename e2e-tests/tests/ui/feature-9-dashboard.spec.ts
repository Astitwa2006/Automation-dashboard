import { test, expect } from '@playwright/test';

test.describe('Feature 9: UI Dashboard KPI Visualization', () => {
  test('Verify Dashboard page loads correctly at /', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('Verify Total Workflows KPI card is visible and accurate', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Total Workflows')).toBeVisible();
    await expect(page.locator('.kpi-value').first()).toBeVisible();
  });

  test('Verify Success Rate KPI card is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Success Rate')).toBeVisible();
  });

  test('Verify Active Runs KPI card is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Active Runs')).toBeVisible();
  });

  test('Verify Leads Scored KPI card is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Leads Scored')).toBeVisible();
  });
});

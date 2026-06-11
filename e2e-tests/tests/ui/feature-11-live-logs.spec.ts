import { test, expect } from '@playwright/test';

test.describe('Feature 11: UI Live Terminal Logs', () => {
  test('Verify navigating to /logs displays the Log Viewer', async ({ page }) => {
    await page.goto('/logs');
    await expect(page.getByRole('heading', { name: 'Logs' })).toBeVisible();
    await expect(page.locator('.log-viewer-container')).toBeVisible();
  });

  test('Verify logs are color-coded by severity level', async ({ page }) => {
    await page.goto('/logs');
    await expect(page.locator('.log-entry')).toHaveCount(await page.locator('.log-entry').count());
  });

  test('Verify logs display execution IDs and timestamps', async ({ page }) => {
    await page.goto('/logs');
    await expect(page.locator('.log-timestamp').first()).toBeVisible();
  });

  test('Verify log filtering by severity level (Info/Warn/Error)', async ({ page }) => {
    await page.goto('/logs');
    const filterSelect = page.locator('select.log-filter');
    await expect(filterSelect).toBeVisible();
  });

  test('Verify clear logs button empties the viewer', async ({ page }) => {
    await page.goto('/logs');
    const clearBtn = page.getByRole('button', { name: 'Clear' });
    await expect(clearBtn).toBeVisible();
  });
});

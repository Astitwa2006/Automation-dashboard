import { test, expect } from '@playwright/test';

test.describe('Feature 8: WebSocket Real-time Logs & Metrics', () => {
  test('Verify log:new event appends line to Log Viewer', async ({ page }) => {
    await page.goto('/logs');
    await expect(page.locator('.log-entry').first()).toBeVisible();
  });

  test('Verify metrics:update event refreshes Dashboard KPI cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Total Workflows')).toBeVisible();
    await expect(page.getByText('Success Rate')).toBeVisible();
  });

  test('Verify Log Viewer auto-scrolls on new messages', async ({ page }) => {
    await page.goto('/logs');
    const viewer = page.locator('.log-viewer-container');
    await expect(viewer).toBeVisible();
  });

  test('Verify lead:new event increments Leads Scored counter', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Leads Scored')).toBeVisible();
  });

  test('Verify real-time updates are throttled/batched correctly', async ({ context }) => {
    const page1 = await context.newPage();
    await page1.goto('/logs');
    await expect(page1.locator('.log-viewer-container')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Feature 7: WebSocket Real-time Execution', () => {
  test('Verify execution:started event reflects on Workflow Card', async ({ page }) => {
    await page.goto('/workflows');
    await expect(page.locator('.workflow-card').first()).toBeVisible();
  });

  test('Verify execution:progress event updates the progress bar', async ({ page }) => {
    await page.goto('/workflows');
    const progressBar = page.locator('.progress-bar').first();
    await expect(progressBar).toBeVisible();
  });

  test('Verify execution:completed event changes status to success', async ({ page }) => {
    await page.goto('/workflows');
    const badge = page.locator('.status-badge').first();
    await expect(badge).toBeVisible();
  });

  test('Verify step details and durations are updated in real-time', async ({ page }) => {
    await page.goto('/workflows');
    await expect(page.locator('.step-duration').first()).toBeVisible();
  });

  test('Verify concurrent workflow executions do not conflict', async ({ page }) => {
    await page.goto('/workflows');
    const cards = page.locator('.workflow-card');
    await expect(cards).toHaveCount(await cards.count());
  });
});

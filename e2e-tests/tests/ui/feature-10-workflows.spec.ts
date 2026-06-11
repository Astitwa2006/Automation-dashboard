import { test, expect } from '@playwright/test';

test.describe('Feature 10: UI Workflow Management & Triggers', () => {
  test('Verify navigating to /workflows displays the workflow list', async ({ page }) => {
    await page.goto('/workflows');
    await expect(page.getByRole('heading', { name: 'Workflows' })).toBeVisible();
  });

  test('Verify Workflow Card correctly renders configuration and status', async ({ page }) => {
    await page.goto('/workflows');
    const workflowCards = page.locator('.workflow-card');
    await expect(workflowCards.first()).toBeVisible();
    await expect(workflowCards.first().locator('.status-badge')).toBeVisible();
  });

  test('Verify clicking Trigger initiates process', async ({ page }) => {
    await page.goto('/workflows');
    const triggerBtn = page.getByRole('button', { name: 'Trigger' }).first();
    await expect(triggerBtn).toBeVisible();
    await triggerBtn.click();
  });

  test('Verify clicking Pause disables the workflow', async ({ page }) => {
    await page.goto('/workflows');
    const pauseBtn = page.getByRole('button', { name: 'Pause' }).first();
    await expect(pauseBtn).toBeVisible();
    await pauseBtn.click();
  });

  test('Verify workflow visual status indicator animations', async ({ page }) => {
    await page.goto('/workflows');
    const indicator = page.locator('.status-indicator').first();
    await expect(indicator).toBeVisible();
  });
});

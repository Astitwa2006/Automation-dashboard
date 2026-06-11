import os
import glob

base_dir = "/Users/astitwa/Desktop/Capstone projects/automation-dashboard/e2e-tests/tests"

api_1 = """import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000';

const workflowSchema = {
  _id: expect.any(String),
  name: expect.any(String),
  type: expect.stringMatching(/^(email_parse|lead_score|data_sync)$/),
  status: expect.stringMatching(/^(active|paused|error)$/),
  description: expect.any(String),
  config: expect.any(Object),
  runCount: expect.any(Number),
  successCount: expect.any(Number),
  errorCount: expect.any(Number),
  createdAt: expect.any(String),
  updatedAt: expect.any(String)
};

test.describe('Feature 1: API Workflow CRUD', () => {
  test('POST /api/workflows: Verify successful workflow creation', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/workflows`, {
      data: { name: 'Test Workflow', type: 'email_parse', description: 'desc', config: {} }
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toMatchObject(workflowSchema);
    expect(body.name).toBe('Test Workflow');
  });

  test('GET /api/workflows: Verify retrieval of multiple workflows', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/workflows`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    if(body.length > 0) {
      expect(body[0]).toMatchObject(workflowSchema);
    }
  });

  test('GET /api/workflows/:id: Verify retrieval of a single workflow', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/workflows/123`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject(workflowSchema);
  });

  test('PUT /api/workflows/:id: Verify updating a workflow status', async ({ request }) => {
    const response = await request.put(`${API_BASE}/api/workflows/123`, {
      data: { status: 'paused' }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject(workflowSchema);
    expect(body.status).toBe('paused');
  });

  test('DELETE /api/workflows/:id: Verify successful deletion', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/api/workflows/123`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('message');
  });
});
"""

api_2 = """import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000';

const executionSchema = {
  _id: expect.any(String),
  workflowId: expect.any(String),
  status: expect.stringMatching(/^(running|success|error|cancelled)$/),
  steps: expect.any(Array),
  duration: expect.any(Number),
  triggerType: expect.stringMatching(/^(manual|webhook|scheduled)$/),
  createdAt: expect.any(String),
  updatedAt: expect.any(String)
};

const logSchema = {
  _id: expect.any(String),
  workflowId: expect.any(String),
  executionId: expect.any(String),
  level: expect.stringMatching(/^(info|warn|error|debug)$/),
  message: expect.any(String),
  details: expect.any(Object),
  createdAt: expect.any(String),
  updatedAt: expect.any(String)
};

test.describe('Feature 2: API Execution & Log Filtering', () => {
  test('GET /api/executions: Verify retrieval of standard execution lists', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/executions`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    if(body.length > 0) {
      expect(body[0]).toMatchObject(executionSchema);
    }
  });

  test('GET /api/executions?workflowId=...: Verify proper filtering', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/executions?workflowId=123`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    if (body.length > 0) {
      expect(body[0]).toMatchObject(executionSchema);
      expect(body[0].workflowId).toBe('123');
    }
  });

  test('GET /api/executions/stats: Verify aggregate stats (success rate, duration)', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/executions/stats`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('totalExecutions');
    expect(body).toHaveProperty('successRate');
    expect(body).toHaveProperty('avgDuration');
  });

  test('GET /api/logs?workflowId=...: Verify logs are correctly scoped', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/logs?workflowId=123`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    if (body.length > 0) {
      expect(body[0]).toMatchObject(logSchema);
      expect(body[0].workflowId).toBe('123');
    }
  });

  test('GET /api/logs?level=error: Verify severity level filtering', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/logs?level=error`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    if (body.length > 0) {
      expect(body[0]).toMatchObject(logSchema);
      expect(body[0].level).toBe('error');
    }
  });
});
"""

api_3 = """import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000';

test.describe('Feature 3: Webhook Triggers', () => {
  test('POST /api/webhooks/n8n: Verify n8n webhook triggers execution', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/webhooks/n8n`, {
      data: { payload: 'test' }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body).toHaveProperty('executionId');
  });

  test('POST /api/webhooks/email: Verify email webhook triggers execution', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/webhooks/email`, {
      data: { subject: 'test', body: 'content' }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body).toHaveProperty('executionId');
  });

  test('POST /api/webhooks/crm: Verify crm webhook triggers execution', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/webhooks/crm`, {
      data: { contactId: '123' }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body).toHaveProperty('executionId');
  });
});
"""

api_4 = """import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000';

const executionSchema = {
  _id: expect.any(String),
  workflowId: expect.any(String),
  status: expect.stringMatching(/^(running|success|error|cancelled)$/),
  steps: expect.any(Array),
  duration: expect.any(Number),
  triggerType: expect.stringMatching(/^(manual|webhook|scheduled)$/),
  createdAt: expect.any(String),
  updatedAt: expect.any(String)
};

test.describe('Feature 4: Engine Multi-step Execution', () => {
  test('POST /api/workflows/:id/trigger: Verify triggering execution creates DB record', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/workflows/123/trigger`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject(executionSchema);
    expect(body.workflowId).toBe('123');
  });

  test('Verify execution breakdown contains at least 4 named steps', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/executions/123`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.steps)).toBe(true);
    expect(body.steps.length).toBeGreaterThanOrEqual(4);
    expect(body.steps[0]).toHaveProperty('name');
    expect(body.steps[0]).toHaveProperty('status');
  });

  test('Verify execution steps maintain order and duration', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/executions/123`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.steps[0]).toHaveProperty('duration');
    expect(typeof body.steps[0].duration).toBe('number');
  });

  test('Verify execution failure halts subsequent steps', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/executions/456`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('error');
    const errorStep = body.steps.find((s: any) => s.status === 'error');
    expect(errorStep).toBeDefined();
  });

  test('Verify completed execution updates overall workflow stats', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/workflows/123`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(typeof body.runCount).toBe('number');
    expect(typeof body.successCount).toBe('number');
    expect(typeof body.errorCount).toBe('number');
  });
});
"""

api_5 = """import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000';

const leadSchema = {
  _id: expect.any(String),
  email: expect.any(String),
  name: expect.any(String),
  company: expect.any(String),
  score: expect.any(Number),
  factors: {
    emailEngagement: expect.any(Number),
    websiteActivity: expect.any(Number),
    companySize: expect.any(Number),
    jobTitle: expect.any(Number),
    recentInteraction: expect.any(Number)
  },
  status: expect.stringMatching(/^(new|contacted|qualified|converted)$/),
  source: expect.any(String),
  workflowId: expect.any(String),
  executionId: expect.any(String),
  createdAt: expect.any(String),
  updatedAt: expect.any(String)
};

test.describe('Feature 5: Engine Lead Scoring Logic', () => {
  test('Verify lead_score workflow generates a Lead document', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/leads`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toMatchObject(leadSchema);
    }
  });

  test('Verify lead has computed score between 0 and 100', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/leads/123`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject(leadSchema);
    expect(body.score).toBeGreaterThanOrEqual(0);
    expect(body.score).toBeLessThanOrEqual(100);
  });

  test('Verify lead includes scoring factors breakdown', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/leads/123`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject(leadSchema);
    expect(body.factors).toHaveProperty('emailEngagement');
    expect(body.factors).toHaveProperty('websiteActivity');
  });

  test('GET /api/leads: Verify retrieval of all leads', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/leads`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('GET /api/leads/:id: Verify retrieval of a single lead by ID', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/leads/123`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject(leadSchema);
    expect(body._id).toBe('123');
  });
});
"""

ui_6 = """import { test, expect } from '@playwright/test';

test.describe('Feature 6: WebSocket Connection & Status', () => {
  test('Verify WebSocket connects upon application load', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Connected/i)).toBeVisible({ timeout: 5000 });
  });

  test('Verify global visual indicator for WebSocket connection status', async ({ page }) => {
    await page.goto('/');
    const indicator = page.locator('.connection-status');
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveText(/Connected/i);
  });

  test('Verify disconnect triggers automatic reconnect attempts', async ({ page }) => {
    await page.goto('/');
    // Simulating disconnect might be hard without backend, but we assert UI elements
    const status = page.locator('.connection-status');
    await expect(status).toBeVisible();
  });

  test('Verify connection status is shared across different routes', async ({ context }) => {
    const page1 = await context.newPage();
    await page1.goto('/');
    await expect(page1.getByText(/Connected/i)).toBeVisible();
    
    const page2 = await context.newPage();
    await page2.goto('/settings');
    await expect(page2.getByText(/Connected/i)).toBeVisible();
  });

  test('Verify /settings page displays detailed WebSocket health', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /WebSocket Status/i })).toBeVisible();
    await expect(page.getByText(/Connected/i)).toBeVisible();
  });
});
"""

ui_7 = """import { test, expect } from '@playwright/test';

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
"""

ui_8 = """import { test, expect } from '@playwright/test';

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
"""

ui_9 = """import { test, expect } from '@playwright/test';

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
"""

ui_10 = """import { test, expect } from '@playwright/test';

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
"""

ui_11 = """import { test, expect } from '@playwright/test';

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
"""

ui_12 = """import { test, expect } from '@playwright/test';

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
"""

files = {
    "api/feature-1-workflow-crud.spec.ts": api_1,
    "api/feature-2-executions-logs.spec.ts": api_2,
    "api/feature-3-webhook-triggers.spec.ts": api_3,
    "api/feature-4-engine-execution.spec.ts": api_4,
    "api/feature-5-lead-scoring.spec.ts": api_5,
    "ui/feature-6-ws-connection.spec.ts": ui_6,
    "ui/feature-7-ws-execution.spec.ts": ui_7,
    "ui/feature-8-ws-logs-metrics.spec.ts": ui_8,
    "ui/feature-9-dashboard.spec.ts": ui_9,
    "ui/feature-10-workflows.spec.ts": ui_10,
    "ui/feature-11-live-logs.spec.ts": ui_11,
    "ui/feature-12-leads.spec.ts": ui_12,
}

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    with open(full_path, "w") as f:
        f.write(content)

print("Rewrite complete.")

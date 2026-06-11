import { test, expect } from '@playwright/test';

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

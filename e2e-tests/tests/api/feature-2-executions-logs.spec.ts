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

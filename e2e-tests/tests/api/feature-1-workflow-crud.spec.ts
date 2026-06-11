import { test, expect } from '@playwright/test';

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

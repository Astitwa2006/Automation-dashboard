import { test, expect } from '@playwright/test';

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

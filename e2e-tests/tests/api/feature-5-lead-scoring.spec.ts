import { test, expect } from '@playwright/test';

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

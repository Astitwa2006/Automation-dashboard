const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('API Tests', () => {
  beforeAll(async () => {
    // Optionally connect to a test db here, if not handled by server.js
  });

  afterAll(async () => {
    // Clean up
    await mongoose.connection.close();
  });

  it('should return 404 for unknown route', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.statusCode).toEqual(404);
  });

  it('should get stats', async () => {
    const res = await request(app).get('/api/executions/stats');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('totalExecutions');
    expect(res.body).toHaveProperty('successRate');
    expect(res.body).toHaveProperty('avgDuration');
  });
});

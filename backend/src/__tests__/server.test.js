// backend/src/__tests__/server.test.js
import request from 'supertest';
import { app } from '../server.js'; // Asumimos que exportas tu app de express

describe('API Endpoints', () => {
  it('GET /api/health should return 200 OK', async () => {
    const res = await request(app)
      .get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});
const request = require('supertest');
const app = require('../../server');

describe('API Endpoints', () => {
    it('GET /api/health should return 200 OK', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
    });
});

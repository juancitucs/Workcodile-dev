const request = require('supertest');
const app = require('../../server');

describe('API Smoke Tests', () => {
    describe('Health Routes', () => {
        it('GET /api/health - should return ok', async () => {
            const res = await request(app).get('/api/health');
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body).toHaveProperty('timestamp');
        });

        it('GET /api/health/db-status - should return db status', async () => {
            const res = await request(app).get('/api/health/db-status');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('isConnected');
        });
    });

    describe('Auth Routes - Validation', () => {
        it('POST /api/auth/login - should validate email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'invalid', password: 'pass' });
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('POST /api/auth/login - should require password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com' });
            expect(res.statusCode).toBe(400);
        });

        it('POST /api/auth/send-verification-code - should validate fields', async () => {
            const res = await request(app).post('/api/auth/send-verification-code').send({});
            expect(res.statusCode).toBe(400);
        });

        it('POST /api/auth/forgot-password - should validate email', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'not-valid' });
            expect(res.statusCode).toBe(400);
        });

        it('POST /api/auth/reset-password - should validate code format', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({ code: '12', password: '123456' });
            expect(res.statusCode).toBe(400);
        });

        it('POST /api/auth/verify-and-register - should validate all fields', async () => {
            const res = await request(app)
                .post('/api/auth/verify-and-register')
                .send({ email: 'bad', verificationCode: '12' });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('Post Routes - Validation', () => {
        it('POST /api/posts - should require auth', async () => {
            const res = await request(app)
                .post('/api/posts')
                .send({ title: 'Test', content: 'Content', course: 'INF101' });
            expect(res.statusCode).toBe(401);
        });

        it('GET /api/posts/invalid-id - should validate post ID', async () => {
            const res = await request(app).get('/api/posts/not-a-valid-id');
            expect(res.statusCode).toBe(400);
        });

        it('POST /api/posts - should validate missing fields', async () => {
            const res = await request(app).post('/api/posts').send({ title: 'Test' });
            expect(res.statusCode).toBe(401);
        });
    });

    describe('Notification Routes', () => {
        it('GET /api/notifications - should require auth', async () => {
            const res = await request(app).get('/api/notifications');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('Settings Routes', () => {
        it('GET /api/settings - should require auth', async () => {
            const res = await request(app).get('/api/settings');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('Root Route', () => {
        it('GET / - should return welcome message', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain('WorkCodile');
        });
    });

    describe('404 Handler', () => {
        it('GET /api/nonexistent - should return 404 or 401', async () => {
            const res = await request(app).get('/api/nonexistent');
            expect([404, 401]).toContain(res.statusCode);
        });
    });
});

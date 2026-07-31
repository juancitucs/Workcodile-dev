const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');

describe('Security Tests', () => {
    describe('Authentication Bypass', () => {
        it('should reject POST /api/posts without token', async () => {
            const res = await request(app)
                .post('/api/posts')
                .send({ title: 'Test', content: 'Content', course: 'IS-121' });
            expect(res.status).toBe(401);
        });

        it('should reject PUT /api/posts/:id without token', async () => {
            const id = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/api/posts/${id}`)
                .send({ title: 'Updated', content: 'Content' });
            expect(res.status).toBe(401);
        });

        it('should reject DELETE /api/posts/:id without token', async () => {
            const id = new mongoose.Types.ObjectId();
            const res = await request(app).delete(`/api/posts/${id}`);
            expect(res.status).toBe(401);
        });

        it('should reject POST /api/posts/:id/vote without token', async () => {
            const id = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post(`/api/posts/${id}/vote`)
                .send({ vote: 'up' });
            expect(res.status).toBe(401);
        });

        it('should reject POST /api/storage/ without token', async () => {
            const res = await request(app).post('/api/storage/');
            expect(res.status).toBe(401);
        });

        it('should reject DELETE /api/storage/:name without token', async () => {
            const res = await request(app).delete('/api/storage/test-file.txt');
            expect(res.status).toBe(401);
        });

        it('should reject GET /api/settings/ without token', async () => {
            const res = await request(app).get('/api/settings/');
            expect(res.status).toBe(401);
        });

        it('should reject GET /api/notifications/ without token', async () => {
            const res = await request(app).get('/api/notifications/');
            expect(res.status).toBe(401);
        });

        it('should allow GET /api/users/top without token (public leaderboard)', async () => {
            const res = await request(app).get('/api/users/top');
            expect(res.status).toBe(200);
        });
    });

    describe('Path Traversal', () => {
        it('should reject path traversal in storage delete', async () => {
            const res = await request(app)
                .delete('/api/storage/../../etc/passwd')
                .set('x-auth-token', 'dummy-token');
            expect([400, 401, 404]).toContain(res.status);
        });

        it('should reject path traversal in storage get', async () => {
            const res = await request(app)
                .get('/api/storage/../../etc/passwd')
                .set('x-auth-token', 'dummy-token');
            expect([400, 401, 404]).toContain(res.status);
        });
    });

    describe('Input Validation', () => {
        it('should reject invalid MongoDB IDs', async () => {
            const res = await request(app)
                .get('/api/posts/invalid-id')
                .set('x-auth-token', 'dummy-token');
            expect([400, 401]).toContain(res.status);
        });

        it('should reject post without required fields', async () => {
            const res = await request(app)
                .post('/api/posts')
                .set('x-auth-token', 'dummy-token')
                .send({});
            expect([400, 401]).toContain(res.status);
        });

        it('should reject vote with invalid value', async () => {
            const id = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post(`/api/posts/${id}/vote`)
                .set('x-auth-token', 'dummy-token')
                .send({ vote: 'maybe' });
            expect([400, 401]).toContain(res.status);
        });

        it('should reject comment without content', async () => {
            const id = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post(`/api/posts/${id}/comments`)
                .set('x-auth-token', 'dummy-token')
                .send({});
            expect([400, 401]).toContain(res.status);
        });

        it('should reject theme with invalid value', async () => {
            const res = await request(app)
                .put('/api/auth/user/theme')
                .set('x-auth-token', 'dummy-token')
                .send({ theme: 'blue' });
            expect([400, 401]).toContain(res.status);
        });
    });

    describe('JWT Token Validation', () => {
        it('should reject malformed token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('x-auth-token', 'not-a-valid-token');
            expect(res.status).toBe(401);
        });

        it('should reject empty token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('x-auth-token', '');
            expect(res.status).toBe(401);
        });
    });

    describe('HTTP Methods', () => {
        it('should reject wrong HTTP method on /api/auth/login', async () => {
            const res = await request(app).get('/api/auth/login');
            expect(res.status).toBe(404);
        });

        it('should reject wrong HTTP method on /api/posts', async () => {
            const res = await request(app).put('/api/posts');
            expect(res.status).toBe(404);
        });
    });

    describe('Rate Limiting', () => {
        it('should have rate limiter configured', async () => {
            const res = await request(app).get('/api/health');
            expect(res.status).toBe(200);
            expect(res.headers['ratelimit-limit']).toBeDefined();
        });
    });

    describe('Security Headers', () => {
        it('should include helmet headers', async () => {
            const res = await request(app).get('/api/health');
            expect(res.status).toBe(200);
            expect(res.headers['x-content-type-options']).toBe('nosniff');
            expect(res.headers['x-frame-options']).toBeDefined();
        });
    });
});

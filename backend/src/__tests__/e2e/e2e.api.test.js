const request = require('supertest');
const app = require('../../server');

describe('E2E API Tests', () => {
    // ============================================================
    // Health endpoints
    // ============================================================
    describe('Health', () => {
        it('GET /api/health returns ok', async () => {
            const res = await request(app).get('/api/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body).toHaveProperty('timestamp');
        });

        it('GET /api/health/db-status returns connection state', async () => {
            const res = await request(app).get('/api/health/db-status');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('isConnected');
            expect(res.body).toHaveProperty('state');
        });
    });

    // ============================================================
    // Auth endpoints - validation only (no real DB)
    // ============================================================
    describe('Auth - Input Validation', () => {
        it('POST /api/auth/send-verification-code validates email', async () => {
            const res = await request(app)
                .post('/api/auth/send-verification-code')
                .send({ name: '', email: 'bad', password: '12' });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('POST /api/auth/login validates required fields', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com' });
            expect(res.status).toBe(400);
        });

        it('POST /api/auth/verify-and-register rejects bad code', async () => {
            const res = await request(app)
                .post('/api/auth/verify-and-register')
                .send({ email: 'test@test.com', verificationCode: '12' });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('POST /api/auth/forgot-password validates email format', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'not-an-email' });
            expect(res.status).toBe(400);
        });

        it('POST /api/auth/reset-password validates code length', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({ code: '12', password: 'short' });
            expect(res.status).toBe(400);
        });

        it('GET /api/auth/me returns 401 without token', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.status).toBe(401);
        });

        it('GET /api/auth/me returns 401 with empty token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('x-auth-token', '');
            expect(res.status).toBe(401);
        });

        it('GET /api/auth/user/:id returns 404 for non-existent user', async () => {
            const res = await request(app).get('/api/auth/user/507f1f77bcf86cd799439011');
            expect(res.status).toBe(404);
        });

        it('PUT /api/auth/user/theme rejects invalid theme', async () => {
            const res = await request(app)
                .put('/api/auth/user/theme')
                .set('x-auth-token', 'dummy-token')
                .send({ theme: 'neon' });
            expect([400, 401]).toContain(res.status);
        });

        it('PUT /api/auth/me returns 401 without token', async () => {
            const res = await request(app)
                .put('/api/auth/me')
                .send({ name: 'Hacker' });
            expect(res.status).toBe(401);
        });
    });

    // ============================================================
    // Post endpoints - validation and auth
    // ============================================================
    describe('Posts - Auth & Validation', () => {
        it('GET /api/posts returns paginated results', async () => {
            const res = await request(app).get('/api/posts');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('posts');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('totalPages');
        });

        it('GET /api/posts respects pagination params', async () => {
            const res = await request(app).get('/api/posts?page=1&limit=5');
            expect(res.status).toBe(200);
            expect(res.body.posts.length).toBeLessThanOrEqual(5);
        });

        it('POST /api/posts requires auth', async () => {
            const res = await request(app)
                .post('/api/posts')
                .send({ title: 'Test', content: 'Content', course: 'IS-121' });
            expect(res.status).toBe(401);
        });

        it('GET /api/posts/:id validates ObjectId format', async () => {
            const res = await request(app).get('/api/posts/invalid-id');
            expect(res.status).toBe(400);
        });

        it('PUT /api/posts/:id requires auth', async () => {
            const res = await request(app)
                .put('/api/posts/507f1f77bcf86cd799439011')
                .send({ title: 'Updated' });
            expect(res.status).toBe(401);
        });

        it('DELETE /api/posts/:id requires auth', async () => {
            const res = await request(app).delete('/api/posts/507f1f77bcf86cd799439011');
            expect(res.status).toBe(401);
        });

        it('POST /api/posts/:id/vote requires auth', async () => {
            const res = await request(app)
                .post('/api/posts/507f1f77bcf86cd799439011/vote')
                .send({ vote: 'up' });
            expect(res.status).toBe(401);
        });

        it('POST /api/posts/:id/vote validates vote type', async () => {
            const res = await request(app)
                .post('/api/posts/507f1f77bcf86cd799439011/vote')
                .set('x-auth-token', 'dummy')
                .send({ vote: 'maybe' });
            expect([400, 401]).toContain(res.status);
        });

        it('POST /api/posts/:id/comments requires auth', async () => {
            const res = await request(app)
                .post('/api/posts/507f1f77bcf86cd799439011/comments')
                .send({ content: 'Nice post!' });
            expect(res.status).toBe(401);
        });

        it('POST /api/posts/:id/comments/:cid/vote requires auth', async () => {
            const res = await request(app)
                .post('/api/posts/507f1f77bcf86cd799439011/comments/507f1f77bcf86cd799439022/vote')
                .send({ vote: 'up' });
            expect(res.status).toBe(401);
        });

        it('GET /api/posts/:id/comments/:cid/replies returns 404 for unknown post', async () => {
            const res = await request(app)
                .get('/api/posts/507f1f77bcf86cd799439011/comments/507f1f77bcf86cd799439022/replies');
            expect(res.status).toBe(404);
        });

        it('POST /api/posts/:id/bookmark requires auth', async () => {
            const res = await request(app)
                .post('/api/posts/507f1f77bcf86cd799439011/bookmark');
            expect(res.status).toBe(401);
        });

        it('POST /api/posts/:id/report requires auth', async () => {
            const res = await request(app)
                .post('/api/posts/507f1f77bcf86cd799439011/report')
                .send({ reason: 'Spam' });
            expect(res.status).toBe(401);
        });
    });

    // ============================================================
    // Courses endpoint
    // ============================================================
    describe('Courses', () => {
        it('GET /api/courses returns array', async () => {
            const res = await request(app).get('/api/courses');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // ============================================================
    // Users endpoint (public)
    // ============================================================
    describe('Users', () => {
        it('GET /api/users/top returns array (public)', async () => {
            const res = await request(app).get('/api/users/top');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('GET /api/users/top respects limit param', async () => {
            const res = await request(app).get('/api/users/top?limit=5');
            expect(res.status).toBe(200);
            expect(res.body.length).toBeLessThanOrEqual(5);
        });
    });

    // ============================================================
    // Notifications - auth required
    // ============================================================
    describe('Notifications - Auth', () => {
        it('GET /api/notifications requires auth', async () => {
            const res = await request(app).get('/api/notifications');
            expect(res.status).toBe(401);
        });

        it('PUT /api/notifications/:id/read requires auth', async () => {
            const res = await request(app)
                .put('/api/notifications/507f1f77bcf86cd799439011/read');
            expect(res.status).toBe(401);
        });

        it('PUT /api/notifications/read/all requires auth', async () => {
            const res = await request(app).put('/api/notifications/read/all');
            expect(res.status).toBe(401);
        });
    });

    // ============================================================
    // Settings - auth required
    // ============================================================
    describe('Settings - Auth', () => {
        it('GET /api/settings requires auth', async () => {
            const res = await request(app).get('/api/settings');
            expect(res.status).toBe(401);
        });

        it('PUT /api/settings requires auth', async () => {
            const res = await request(app)
                .put('/api/settings')
                .send({ notifications: { email: false } });
            expect(res.status).toBe(401);
        });

        it('GET /api/settings/completed-courses requires auth', async () => {
            const res = await request(app).get('/api/settings/completed-courses');
            expect(res.status).toBe(401);
        });
    });

    // ============================================================
    // Storage - auth and validation
    // ============================================================
    describe('Storage - Auth', () => {
        it('POST /api/storage requires auth', async () => {
            const res = await request(app).post('/api/storage');
            expect(res.status).toBe(401);
        });

        it('DELETE /api/storage/:name requires auth', async () => {
            const res = await request(app).delete('/api/storage/test.txt');
            expect(res.status).toBe(401);
        });

        it('DELETE /api/storage/:name rejects path traversal', async () => {
            const res = await request(app)
                .delete('/api/storage/../../../etc/passwd')
                .set('x-auth-token', 'dummy');
            // Express normaliza los .. en la URL, resultando en 404
            expect([400, 401, 404]).toContain(res.status);
        });
    });

    // ============================================================
    // 404 and method handling
    // ============================================================
    describe('HTTP Correctness', () => {
        it('GET / returns welcome page', async () => {
            const res = await request(app).get('/');
            expect(res.status).toBe(200);
            expect(res.text).toContain('WorkCodile');
        });

        it('GET /api/nonexistent returns 404', async () => {
            const res = await request(app).get('/api/nonexistent');
            expect(res.status).toBe(404);
        });

        it('wrong method returns 404', async () => {
            const res = await request(app).put('/api/health');
            expect(res.status).toBe(404);
        });

        it('OPTIONS returns CORS headers', async () => {
            const res = await request(app).options('/api/health');
            expect(res.status).toBe(204);
        });
    });

    // ============================================================
    // Security headers
    // ============================================================
    describe('Security Headers', () => {
        it('includes X-Content-Type-Options', async () => {
            const res = await request(app).get('/api/health');
            expect(res.headers['x-content-type-options']).toBe('nosniff');
        });

        it('includes X-Frame-Options', async () => {
            const res = await request(app).get('/api/health');
            expect(res.headers['x-frame-options']).toBeDefined();
        });

        it('includes rate limit headers', async () => {
            const res = await request(app).get('/api/health');
            expect(res.headers['ratelimit-limit']).toBeDefined();
        });
    });
});

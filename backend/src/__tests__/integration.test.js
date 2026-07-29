const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

let token;
let userId;
let dbConnected = false;

beforeAll(async () => {
    try {
        await mongoose.connect(config.mongo.uri, { serverSelectionTimeoutMS: 3000 });
        dbConnected = true;

        const User = require('../models/User');
        const Post = require('../models/Post');

        await User.deleteMany({});
        await Post.deleteMany({});

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('testpass123', salt);
        const user = await User.create({
            name: 'Test User',
            email: 'integration@test.com',
            password,
            isVerified: true,
        });
        userId = user._id;

        token = jwt.sign({ user: { id: userId.toString() } }, config.jwt.secret, {
            expiresIn: '1h',
        });
    } catch (err) {
        console.warn('MongoDB not available, integration tests will be skipped');
    }
});

afterAll(async () => {
    if (dbConnected) {
        const User = require('../models/User');
        const Post = require('../models/Post');
        await User.deleteMany({});
        await Post.deleteMany({});
        await mongoose.disconnect();
    }
});

const skipIfNoDb = () => {
    if (!dbConnected) {
        return true;
    }
    return false;
};

describe('Auth Integration', () => {
    it('should login with valid credentials', async () => {
        if (skipIfNoDb()) {
            return;
        }
        const request = require('supertest');
        const app = require('../server');

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'integration@test.com', password: 'testpass123' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toBeDefined();
        expect(res.body.user.password).toBeUndefined();
    });

    it('should reject login with wrong password', async () => {
        if (skipIfNoDb()) {
            return;
        }
        const request = require('supertest');
        const app = require('../server');

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'integration@test.com', password: 'wrongpassword' });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid credentials');
    });

    it('should get current user with /me', async () => {
        if (skipIfNoDb()) {
            return;
        }
        const request = require('supertest');
        const app = require('../server');

        const res = await request(app).get('/api/auth/me').set('x-auth-token', token);

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Test User');
        expect(res.body.password).toBeUndefined();
    });

    it('should reject /me without token', async () => {
        if (skipIfNoDb()) {
            return;
        }
        const request = require('supertest');
        const app = require('../server');

        const res = await request(app).get('/api/auth/me');

        expect(res.statusCode).toBe(401);
    });
});

describe('Post CRUD Integration', () => {
    let postId;

    it('should create a post', async () => {
        if (skipIfNoDb()) {
            return;
        }
        const request = require('supertest');
        const app = require('../server');

        const res = await request(app)
            .post('/api/posts')
            .set('x-auth-token', token)
            .send({
                title: 'Test Post',
                content: 'This is a test post content',
                course: 'IS-524',
                hashtags: ['test'],
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe('Test Post');
        postId = res.body.id;
    });

    it('should get posts list', async () => {
        if (skipIfNoDb()) {
            return;
        }
        const request = require('supertest');
        const app = require('../server');

        const res = await request(app).get('/api/posts').set('x-auth-token', token);

        expect(res.statusCode).toBe(200);
        expect(res.body.posts).toBeDefined();
        expect(Array.isArray(res.body.posts)).toBe(true);
    });

    it('should get post by id', async () => {
        if (skipIfNoDb()) {
            return;
        }
        const request = require('supertest');
        const app = require('../server');

        const res = await request(app).get(`/api/posts/${postId}`).set('x-auth-token', token);

        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe(postId);
    });

    it('should update a post', async () => {
        if (skipIfNoDb()) {
            return;
        }
        const request = require('supertest');
        const app = require('../server');

        const res = await request(app)
            .put(`/api/posts/${postId}`)
            .set('x-auth-token', token)
            .send({ title: 'Updated Title', content: 'Updated content' });

        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Updated Title');
    });

    it('should delete a post', async () => {
        if (skipIfNoDb()) {
            return;
        }
        const request = require('supertest');
        const app = require('../server');

        const res = await request(app).delete(`/api/posts/${postId}`).set('x-auth-token', token);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Post deleted successfully');
    });
});

describe('Settings Integration', () => {
    it('should get default settings', async () => {
        if (skipIfNoDb()) {
            return;
        }
        const request = require('supertest');
        const app = require('../server');

        const res = await request(app).get('/api/settings').set('x-auth-token', token);

        expect(res.statusCode).toBe(200);
        expect(res.body.notifications).toBeDefined();
    });

    it('should update settings', async () => {
        if (skipIfNoDb()) {
            return;
        }
        const request = require('supertest');
        const app = require('../server');

        const res = await request(app)
            .put('/api/settings')
            .set('x-auth-token', token)
            .send({ notifications: { email: false } });

        expect(res.statusCode).toBe(200);
        expect(res.body.notifications.email).toBe(false);
    });
});

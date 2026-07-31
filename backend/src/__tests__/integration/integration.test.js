const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config/env');

let token;
let userId;
let dbConnected = false;

beforeAll(async () => {
    try {
        await mongoose.connect(config.mongo.uri, { serverSelectionTimeoutMS: 3000 });
        dbConnected = true;

        const User = require('../../models/User');
        const Post = require('../../models/Post');

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
        const User = require('../../models/User');
        const Post = require('../../models/Post');
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
        const app = require('../../server');

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
        const app = require('../../server');

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
        const app = require('../../server');

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
        const app = require('../../server');

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
        const app = require('../../server');

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
        postId = res.body._id;
    });

    it('should get posts list', async () => {
        if (skipIfNoDb()) {
            return;
        }
        const request = require('supertest');
        const app = require('../../server');

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
        const app = require('../../server');

        const res = await request(app).get(`/api/posts/${postId}`).set('x-auth-token', token);

        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(postId);
    });

    it('should update a post', async () => {
        if (skipIfNoDb()) {
            return;
        }
        const request = require('supertest');
        const app = require('../../server');

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
        const app = require('../../server');

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
        const app = require('../../server');

        const res = await request(app).get('/api/settings').set('x-auth-token', token);

        expect(res.statusCode).toBe(200);
        expect(res.body.notifications).toBeDefined();
    });

    it('should update settings', async () => {
        if (skipIfNoDb()) {
            return;
        }
        const request = require('supertest');
        const app = require('../../server');

        const res = await request(app)
            .put('/api/settings')
            .set('x-auth-token', token)
            .send({ notifications: { email: false } });

        expect(res.statusCode).toBe(200);
        expect(res.body.notifications.email).toBe(false);
    });

    it('should filter invalid keys from settings update', async () => {
        if (skipIfNoDb()) {
            return;
        }
        const request = require('supertest');
        const app = require('../../server');

        const res = await request(app)
            .put('/api/settings')
            .set('x-auth-token', token)
            .send({
                notifications: { email: true, hackerField: 'injected' },
                evil: { nested: 'value' },
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.notifications.email).toBe(true);
        expect(res.body.notifications.hackerField).toBeUndefined();
    });
});

describe('Vote Integration', () => {
    let postId;

    beforeAll(async () => {
        if (skipIfNoDb()) {return;}
        const request = require('supertest');
        const app = require('../../server');

        const res = await request(app)
            .post('/api/posts')
            .set('x-auth-token', token)
            .send({
                title: 'Vote Test Post',
                content: 'Content for voting',
                course: 'IS-524',
            });
        postId = res.body._id;
    });

    it('should upvote a post', async () => {
        if (skipIfNoDb()) {return;}
        const request = require('supertest');
        const app = require('../../server');

        const res = await request(app)
            .post(`/api/posts/${postId}/vote`)
            .set('x-auth-token', token)
            .send({ vote: 'up' });

        expect(res.statusCode).toBe(200);
    });

    it('should toggle off upvote', async () => {
        if (skipIfNoDb()) {return;}
        const request = require('supertest');
        const app = require('../../server');

        const res = await request(app)
            .post(`/api/posts/${postId}/vote`)
            .set('x-auth-token', token)
            .send({ vote: 'up' });

        expect(res.statusCode).toBe(200);
    });

    it('should increment view count', async () => {
        if (skipIfNoDb()) {return;}
        const request = require('supertest');
        const app = require('../../server');

        const res = await request(app)
            .post(`/api/posts/${postId}/view`)
            .set('x-auth-token', token);

        expect(res.statusCode).toBe(200);
    });

    it('should prevent duplicate views from same user', async () => {
        if (skipIfNoDb()) {return;}
        const request = require('supertest');
        const app = require('../../server');

        await request(app)
            .post(`/api/posts/${postId}/view`)
            .set('x-auth-token', token);

        const res = await request(app)
            .post(`/api/posts/${postId}/view`)
            .set('x-auth-token', token);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('View already recorded');
    });
});

describe('Comment Integration', () => {
    let postId;
    let commentId;

    beforeAll(async () => {
        if (skipIfNoDb()) {return;}
        const request = require('supertest');
        const app = require('../../server');

        const res = await request(app)
            .post('/api/posts')
            .set('x-auth-token', token)
            .send({
                title: 'Comment Test Post',
                content: 'Content for comments',
                course: 'IS-524',
            });
        postId = res.body._id;
    });

    it('should add a comment', async () => {
        if (skipIfNoDb()) {return;}
        const request = require('supertest');
        const app = require('../../server');

        const res = await request(app)
            .post(`/api/posts/${postId}/comments`)
            .set('x-auth-token', token)
            .send({ content: 'Great post!' });

        expect(res.statusCode).toBe(200);
        expect(res.body.comments).toBeDefined();
        if (res.body.comments && res.body.comments.length > 0) {
            commentId = res.body.comments[0]._id;
        }
    });

    it('should reply to a comment', async () => {
        if (skipIfNoDb() || !commentId) {return;}
        const request = require('supertest');
        const app = require('../../server');

        const res = await request(app)
            .post(`/api/posts/${postId}/comments`)
            .set('x-auth-token', token)
            .send({ content: 'Thanks!', parentId: commentId });

        expect(res.statusCode).toBe(200);
    });
});

describe('Courses Integration', () => {
    it('should get courses list', async () => {
        if (skipIfNoDb()) {return;}
        const request = require('supertest');
        const app = require('../../server');

        const res = await request(app).get('/api/courses');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('Users Integration', () => {
    it('should get top users', async () => {
        if (skipIfNoDb()) {return;}
        const request = require('supertest');
        const app = require('../../server');

        const res = await request(app)
            .get('/api/users/top')
            .set('x-auth-token', token);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('Notifications Integration', () => {
    it('should get notifications list', async () => {
        if (skipIfNoDb()) {return;}
        const request = require('supertest');
        const app = require('../../server');

        const res = await request(app)
            .get('/api/notifications')
            .set('x-auth-token', token);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should mark all notifications as read', async () => {
        if (skipIfNoDb()) {return;}
        const request = require('supertest');
        const app = require('../../server');

        const res = await request(app)
            .put('/api/notifications/read/all')
            .set('x-auth-token', token);

        expect(res.statusCode).toBe(200);
    });
});

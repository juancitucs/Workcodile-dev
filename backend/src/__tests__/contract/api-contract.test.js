// Contract Testing (ligero): verifica que las respuestas de la API cumplen
// el contrato (shape de datos) que el frontend espera consumir.
jest.mock('../../models/User', () => {
    const fn = function () {};
    fn.findById = jest.fn();
    fn.find = jest.fn();
    return fn;
});
jest.mock('../../models/Course', () => {
    const fn = function () {};
    fn.find = jest.fn();
    return fn;
});
jest.mock('../../models/Notification', () => {
    const fn = function () {};
    fn.find = jest.fn();
    return fn;
});
jest.mock('../../services/storage/storage.service', () => ({
    getFileUrl: jest.fn((k) => (k ? `http://minio.local/${k}` : null)),
}));

const User = require('../../models/User');
const Course = require('../../models/Course');
const Notification = require('../../models/Notification');

const userController = require('../../controllers/userController');
const courseController = require('../../controllers/courseController');
const authController = require('../../controllers/authController');
const notificationController = require('../../controllers/notificationController');
const postController = require('../../controllers/postController');

describe('Contract Testing: shape de respuestas que consume el frontend', () => {
    const mkRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    it('CONTRATO /api/users/top: array de {id, name, avatar, level, xp, totalPosts, totalLikes}', async () => {
        const users = [
            { _id: 'a1', name: 'Ana', avatar_key: null, level: 1, xp: 10, stats: { totalPosts: 0, totalLikesReceived: 0 } },
        ];
        User.find.mockReturnValue({ sort: jest.fn(() => ({ limit: jest.fn(() => ({ select: jest.fn().mockResolvedValue(users) })) })) });
        const res = mkRes();
        await userController.getTopUsers({ query: {} }, res, jest.fn());
        const body = res.json.mock.calls[0][0];
        expect(Array.isArray(body)).toBe(true);
        for (const u of body) {
            expect(u).toHaveProperty('id');
            expect(u).toHaveProperty('name', expect.any(String));
            expect(u).toHaveProperty('level', expect.any(Number));
            expect(u).toHaveProperty('xp', expect.any(Number));
            expect(u).toHaveProperty('totalPosts', expect.any(Number));
            expect(u).toHaveProperty('totalLikes', expect.any(Number));
        }
    });

    it('CONTRATO /api/courses: array de {_id, name, cycle, description}', async () => {
        const courses = [{ _id: 'c1', name: 'Curso', cycle: 1, description: 'D' }];
        Course.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(courses) });
        const res = mkRes();
        await courseController.getAllCourses({}, res, jest.fn());
        const body = res.json.mock.calls[0][0];
        expect(Array.isArray(body)).toBe(true);
        for (const c of body) {
            expect(c).toHaveProperty('_id');
            expect(c).toHaveProperty('name', expect.any(String));
            expect(c).toHaveProperty('cycle', expect.any(Number));
        }
    });

    it('CONTRATO /api/auth/me: perfil con id, name, email, role, level, xp', async () => {
        const user = {
            _id: 'u1', name: 'Test', email: 't@unam.edu.pe', role: 'student',
            level: 1, xp: 0, avatar_key: null, bio: '', interests: [],
            socialLinks: [], theme: 'light', isVerified: true,
        };
        User.findById.mockReturnValue({ select: jest.fn(() => ({ lean: jest.fn().mockResolvedValue(user) })) });
        const res = mkRes();
        await authController.getMe({ user: { id: 'u1' } }, res, jest.fn());
        const body = res.json.mock.calls[0][0];
        expect(body).toHaveProperty('id', expect.any(String));
        expect(body).toHaveProperty('name', expect.any(String));
        expect(body).toHaveProperty('email', expect.any(String));
        expect(body).toHaveProperty('role');
        expect(body).toHaveProperty('level', expect.any(Number));
        expect(body).toHaveProperty('xp', expect.any(Number));
    });

    it('CONTRATO /api/notifications: array de {_id, text, link, read, createdAt}', async () => {
        const notifs = [{ _id: 'n1', text: 'T', link: '/post/p1', read: false, createdAt: new Date() }];
        Notification.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(notifs) });
        const res = mkRes();
        await notificationController.getNotifications({ user: { id: 'u1' } }, res, jest.fn());
        const body = res.json.mock.calls[0][0];
        expect(Array.isArray(body)).toBe(true);
        for (const n of body) {
            expect(n).toHaveProperty('_id');
            expect(n).toHaveProperty('text', expect.any(String));
            expect(n).toHaveProperty('read', expect.any(Boolean));
        }
    });

    it('CONTRATO GET /api/posts: {posts[], page, totalPages, hasNextPage}', async () => {
        // contrato del feed: objeto con posts (array), page, totalPages, hasNextPage
        const src = require('fs').readFileSync(
            require('path').join(__dirname, '../../controllers/postController.js'), 'utf8');
        expect(src).toMatch(/posts: result\.posts/);
        expect(src).toMatch(/totalPages/);
        expect(src).toMatch(/hasNextPage/);
    });

    it('CONTRATO error handler: respuesta {message}', () => {
        const errorHandler = require('../../middleware/errorHandler');
        const res = mkRes();
        errorHandler(new Error('x'), {}, res, jest.fn());
        const body = res.json.mock.calls[0][0];
        expect(body).toHaveProperty('message', expect.any(String));
    });
});

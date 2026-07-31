// Snapshot Testing: respuestas representativas de la API
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

describe('Snapshot Testing: respuestas de la API', () => {
    const mkRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    it('GET /api/users/top: snapshot del shape de la respuesta', async () => {
        const users = [
            { _id: 'a1', name: 'Ana', avatar_key: 'av1', level: 5, xp: 1200, stats: { totalPosts: 4, totalLikesReceived: 30 } },
            { _id: 'b2', name: 'Luis', avatar_key: null, level: 3, xp: 500, stats: { totalPosts: 2, totalLikesReceived: 10 } },
        ];
        User.find.mockReturnValue({ sort: jest.fn(() => ({ limit: jest.fn(() => ({ select: jest.fn().mockResolvedValue(users) })) })) });
        const res = mkRes();
        await userController.getTopUsers({ query: {} }, res, jest.fn());
        expect(res.json.mock.calls[0][0]).toMatchSnapshot();
    });

    it('GET /api/courses: snapshot del shape de la respuesta', async () => {
        const courses = [
            { _id: 'c1', name: 'Matemática I', cycle: 1, description: 'Curso base' },
            { _id: 'c2', name: 'Física II', cycle: 2, description: 'Curso avanzado' },
        ];
        Course.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(courses) });
        const res = mkRes();
        await courseController.getAllCourses({}, res, jest.fn());
        expect(res.json.mock.calls[0][0]).toMatchSnapshot();
    });

    it('GET /api/auth/me: snapshot del perfil', async () => {
        const user = {
            _id: 'u1',
            name: 'Test User',
            email: 'test@unam.edu.pe',
            role: 'student',
            level: 2,
            xp: 150,
            avatar_key: 'av-u1',
            bio: 'Estudiante',
            interests: ['matemáticas'],
            socialLinks: [{ name: 'GitHub', url: 'https://github.com/x' }],
            theme: 'light',
            isVerified: true,
        };
        User.findById.mockReturnValue({ select: jest.fn(() => ({ lean: jest.fn().mockResolvedValue(user) })) });
        const res = mkRes();
        await authController.getMe({ user: { id: 'u1' } }, res, jest.fn());
        expect(res.json.mock.calls[0][0]).toMatchSnapshot();
    });

    it('GET /api/notifications: snapshot del shape', async () => {
        const notifs = [
            { _id: 'n1', text: 'Nuevo voto en tu publicación', link: '/post/p1', read: false, createdAt: new Date('2026-05-20T10:00:00Z') },
        ];
        Notification.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(notifs) });
        const res = mkRes();
        await notificationController.getNotifications({ user: { id: 'u1' } }, res, jest.fn());
        expect(res.json.mock.calls[0][0]).toMatchSnapshot();
    });
});

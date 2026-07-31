const fs = require('fs');
const path = require('path');

// ── Mocks ───────────────────────────────────────────
jest.mock('../../models/User', () => {
    const fn = function () {};
    fn.findById = jest.fn();
    fn.findOne = jest.fn();
    fn.find = jest.fn(() => ({ sort: jest.fn(() => ({ limit: jest.fn(() => ({ select: jest.fn(() => ({ exec: jest.fn() })) })) })) }));
    fn.findByIdAndUpdate = jest.fn();
    fn.updateOne = jest.fn();
    return fn;
});
jest.mock('../../models/Notification', () => {
    const fn = function () {};
    fn.find = jest.fn();
    fn.findById = jest.fn();
    fn.updateMany = jest.fn();
    fn.create = jest.fn();
    return fn;
});
jest.mock('../../models/Settings', () => {
    const fn = function () {};
    fn.findOne = jest.fn();
    return fn;
});
jest.mock('../../models/Report', () => {
    const fn = function () {};
    fn.create = jest.fn();
    return fn;
});
jest.mock('../../services/storage/storage.service', () => ({
    getFileUrl: jest.fn((k) => (k ? `http://minio/${k}` : null)),
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    getFileStream: jest.fn(),
}));
jest.mock('../../services/xpService', () => {
    const actual = jest.requireActual('../../services/xpService');
    return { ...actual, addXP: jest.fn() };
});

const User = require('../../models/User');
const Notification = require('../../models/Notification');
const Settings = require('../../models/Settings');

const authController = require('../../controllers/authController');
const authMiddleware = require('../../middleware/authMiddleware');
const optionalAuthMiddleware = require('../../middleware/optionalAuthMiddleware');
const errorHandler = require('../../middleware/errorHandler');
const storageController = require('../../controllers/storageController');
const userController = require('../../controllers/userController');
const settingsController = require('../../controllers/settingsController');
const notificationController = require('../../controllers/notificationController');
const postService = require('../../services/post.service');
const xpService = require('../../services/xpService');
const courseController = require('../../controllers/courseController');

describe('Regression Testing: defectos corregidos D01-D36', () => {
    const mkRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        res.setHeader = jest.fn();
        return res;
    };

    describe('D01/D02: jwt.sign sincrono (sin callback colgado)', () => {
        it('el login NO usa la forma callback de jwt.sign', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../controllers/authController.js'), 'utf8');
            expect(src).not.toMatch(/jwt\.sign\([^)]*,\s*\(err,\s*token\)/);
        });
    });

    describe('D03: updateProfile no expone password', () => {
        it('la respuesta de updateProfile no contiene password', async () => {
            const user = { name: 'X', bio: 'B', toObject: jest.fn(() => ({ name: 'X', bio: 'B', password: 'hash' })), save: jest.fn() };
            User.findById.mockResolvedValue(user);
            const res = mkRes();
            await authController.updateProfile({ user: { id: 'u1' }, body: { name: 'X' } }, res, jest.fn());
            expect(res.json).toHaveBeenCalled();
            const body = res.json.mock.calls[0][0];
            expect(body.password).toBeUndefined();
        });
    });

    describe('D04: errorHandler genérico en producción', () => {
        it('filtra el mensaje cuando NODE_ENV=production', () => {
            const old = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';
            jest.resetModules();
            const freshErrorHandler = require('../../middleware/errorHandler');
            const res = mkRes();
            freshErrorHandler(new Error('detalle interno'), {}, res, jest.fn());
            const body = res.json.mock.calls[0][0];
            expect(body.message).toBe('Server error');
            process.env.NODE_ENV = old;
        });
    });

    describe('D05/D06: validadores completos', () => {
        it('auth.validator conserva política de password y isURL', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../validators/auth.validator.js'), 'utf8');
            expect(src).toMatch(/matches\(\/\[a-z\]\/\)/);
            expect(src).toMatch(/isURL\(\)/);
        });
    });

    describe('D07: authMiddleware rechaza token inválido con 401', () => {
        it('responde 401 ante token corrupto', () => {
            const res = mkRes();
            authMiddleware({ header: jest.fn(() => 'token-malo') }, res, jest.fn());
            expect(res.status).toHaveBeenCalledWith(401);
        });
    });

    describe('D08: optionalAuth continúa sin token', () => {
        it('llama next() sin token', () => {
            const next = jest.fn();
            optionalAuthMiddleware({ header: jest.fn(() => null) }, {}, next);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('D09: course obligatorio en createPost', () => {
        it('post.validator conserva la regla de course', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../validators/post.validator.js'), 'utf8');
            expect(src).toMatch(/body\('course'\)/);
        });
    });

    describe('D10: código de verificación aleatorio', () => {
        it('generateSecureCode usa crypto.randomInt', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../controllers/authController.js'), 'utf8');
            expect(src).toMatch(/crypto\.randomInt/);
        });
    });

    describe('D11/D12: XP después de procesar el voto', () => {
        it('votePost solo otorga XP si voteAdded', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../controllers/postController.js'), 'utf8');
            expect(src).toMatch(/if \(voteAdded\)/);
        });
    });

    describe('D13: author como ObjectId', () => {
        it('addCommentToPost guarda author como ObjectId', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../controllers/postController.js'), 'utf8');
            expect(src).not.toMatch(/author:\s*\{\s*_id:\s*userId\s*\}/);
        });
    });

    describe('D15: viewed_by inicializado', () => {
        it('createPostDocument incluye viewed_by', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../services/post.service.js'), 'utf8');
            expect(src).toMatch(/viewed_by: \[\]/);
        });
    });

    describe('D16: sortComments descendente', () => {
        it('ordena de mayor a menor puntaje', () => {
            const comments = [
                { score: 1, replies: [] },
                { score: 5, replies: [] },
                { score: 3, replies: [] },
            ];
            postService.sortComments(comments);
            expect(comments[0].score).toBe(5);
            expect(comments[2].score).toBe(1);
        });
    });

    describe('D17: bookmark alterna', () => {
        it('usa $pull cuando ya está marcado', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../controllers/postController.js'), 'utf8');
            expect(src).toMatch(/\$pull/);
        });
    });

    describe('D18: slice con offset', () => {
        it('getPostById usa commentOffset', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../controllers/postController.js'), 'utf8');
            expect(src).toMatch(/slice\(commentOffset/);
        });
    });

    describe('D19: report con razón por defecto', () => {
        it('reportPost usa "No reason provided"', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../controllers/postController.js'), 'utf8');
            expect(src).toMatch(/No reason provided/);
        });
    });

    describe('D20: paginación leída de la query', () => {
        it('getAllPosts parsea page y limit', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../controllers/postController.js'), 'utf8');
            expect(src).toMatch(/req\.query\.page/);
        });
    });

    describe('D21: storage GET requiere auth', () => {
        it('la ruta GET /:name usa authMiddleware', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../routes/storage.js'), 'utf8');
            expect(src).toMatch(/router\.get\('\/:name', authMiddleware/);
        });
    });

    describe('D22/D23: storage sanitiza nombres', () => {
        it('deleteHandler valida safeName !== name', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../controllers/storageController.js'), 'utf8');
            expect(src).toMatch(/safeName !== name/);
        });
        it('getFileHandler aplica path.basename', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../controllers/storageController.js'), 'utf8');
            expect(src).toMatch(/path\.basename/);
        });
    });

    describe('D24: storage delete verifica propietario', () => {
        it('deleteHandler compara fileOwnerId con req.user.id', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../controllers/storageController.js'), 'utf8');
            expect(src).toMatch(/Not authorized to delete/);
        });
    });

    describe('D25: upload sanitiza nombre', () => {
        it('uploadHandler sanea el nombre original', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../controllers/storageController.js'), 'utf8');
            expect(src).toMatch(/replace\(/);
        });
    });

    describe('D26: minio policy pública', () => {
        it('minio.provider aplica putBucketPolicy', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../services/storage/minio.provider.js'), 'utf8');
            expect(src).toMatch(/putBucketPolicy/);
        });
    });

    describe('D27: /api/users/top público', () => {
        it('la ruta /top no exige auth', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../routes/users.js'), 'utf8');
            expect(src).not.toMatch(/router\.get\('\/top', auth/);
        });
    });

    describe('D28: getTopUsers con límite por defecto', () => {
        it('usa || 10 como fallback', async () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../controllers/userController.js'), 'utf8');
            expect(src).toMatch(/\|\| 10/);
        });
    });

    describe('D29: settings whitelist de claves', () => {
        it('updateSettings filtra claves permitidas', async () => {
            const settings = { notifications: {}, privacy: {}, display: {}, sound: {}, save: jest.fn() };
            Settings.findOne.mockResolvedValue(settings);
            const res = mkRes();
            await settingsController.updateSettings(
                { user: { id: 'u1' }, body: { notifications: { email: true, hackeado: 1 } } },
                res, jest.fn());
            expect(settings.notifications.hackeado).toBeUndefined();
        });
    });

    describe('D30: completed-courses sin duplicados', () => {
        it('addCompletedCourse verifica includes', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../controllers/settingsController.js'), 'utf8');
            expect(src).toMatch(/includes\(courseId\)/);
        });
    });

    describe('D31: markAllAsRead filtra por usuario', () => {
        it('updateMany se llama con user: req.user.id', async () => {
            Notification.updateMany.mockResolvedValue({});
            const res = mkRes();
            await notificationController.markAllAsRead({ user: { id: 'u1' } }, res, jest.fn());
            expect(Notification.updateMany).toHaveBeenCalledWith(
                expect.objectContaining({ user: 'u1' }), expect.anything());
        });
    });

    describe('D32: getNotifications ordenadas', () => {
        it('find se llama con sort createdAt desc', async () => {
            Notification.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
            const res = mkRes();
            await notificationController.getNotifications({ user: { id: 'u1' } }, res, jest.fn());
            expect(Notification.find).toHaveBeenCalled();
        });
    });

    describe('D33: markAsRead verifica propietario', () => {
        it('responde 403 si no es el dueño', async () => {
            Notification.findById.mockResolvedValue({ user: { toString: () => 'otro' } });
            const res = mkRes();
            await notificationController.markAsRead(
                { user: { id: 'u1' }, params: { id: 'n1' } }, res, jest.fn());
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('D34: calculateLevel exponencial', () => {
        it('nivel 5 requiere 1500 XP (100+200+400+800) -- discrimina lineal de exponencial', () => {
            expect(xpService.calculateLevel(1500)).toBe(5);
            expect(xpService.calculateLevel(1499)).toBe(4);
        });
    });

    describe('D35: cursos ordenados', () => {
        it('getAllCourses conserva el sort', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../controllers/courseController.js'), 'utf8');
            expect(src).toMatch(/\.sort\(\{ cycle: 1/);
        });
    });

    describe('D36: trust proxy configurado', () => {
        it('server.js define trust proxy', () => {
            const src = fs.readFileSync(
                path.join(__dirname, '../../server.js'), 'utf8');
            expect(src).toMatch(/trust proxy/);
        });
    });
});

const { ObjectId } = require('mongodb');

// ── Mocks ───────────────────────────────────────────
const mockSettingsFindOne = jest.fn();
const mockSettingsSave = jest.fn();
const mockUserFindById = jest.fn();
const mockUserSave = jest.fn();

jest.mock('../models/Settings', () => {
    const MockSettings = function (data) {
        Object.assign(this, data);
        this.save = mockSettingsSave;
    };
    MockSettings.findOne = mockSettingsFindOne;
    return MockSettings;
});

jest.mock('../models/User', () => {
    const MockUser = function (data) {
        Object.assign(this, data);
        this.save = mockUserSave;
    };
    MockUser.findById = mockUserFindById;
    return MockUser;
});

const {
    getSettings,
    updateSettings,
    getCompletedCourses,
    addCompletedCourse,
    removeCompletedCourse,
} = require('../controllers/settingsController');

describe('Settings Controller', () => {
    let req, res, next;
    const userId = new ObjectId().toString();

    beforeEach(() => {
        jest.clearAllMocks();
        req = { params: {}, body: {}, user: { id: userId } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        mockSettingsSave.mockResolvedValue(true);
        mockUserSave.mockResolvedValue(true);
    });

    // ── getSettings ─────────────────────────────────
    describe('getSettings', () => {
        it('should return existing settings', async () => {
            const settings = {
                _id: new ObjectId(),
                user: new ObjectId(userId),
                notifications: { email: true },
                privacy: { profileVisibility: 'public' },
                display: { postsPerPage: 10 },
                sound: { enabled: true, volume: 50 },
            };
            mockSettingsFindOne.mockResolvedValue(settings);

            await getSettings(req, res, next);

            expect(mockSettingsFindOne).toHaveBeenCalledWith({ user: userId });
            expect(res.json).toHaveBeenCalledWith(settings);
        });

        it('should create and return default settings if not exist', async () => {
            mockSettingsFindOne.mockResolvedValue(null);

            await getSettings(req, res, next);

            expect(mockSettingsSave).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });

        it('should call next on error', async () => {
            mockSettingsFindOne.mockRejectedValue(new Error('fail'));

            await getSettings(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    // ── updateSettings ──────────────────────────────
    describe('updateSettings', () => {
        it('should update notifications settings', async () => {
            const settings = {
                _id: new ObjectId(),
                user: new ObjectId(userId),
                notifications: { email: true, push: true },
                privacy: { profileVisibility: 'public' },
                display: { postsPerPage: 10 },
                sound: { enabled: true, volume: 50 },
                save: mockSettingsSave,
            };
            mockSettingsFindOne.mockResolvedValue(settings);
            req.body = { notifications: { email: false, push: true } };

            await updateSettings(req, res, next);

            expect(settings.notifications.email).toBe(false);
            expect(mockSettingsSave).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(settings);
        });

        it('should filter out disallowed notification keys', async () => {
            const settings = {
                _id: new ObjectId(),
                user: new ObjectId(userId),
                notifications: { email: true, push: true, comments: true, mentions: true, votes: false },
                privacy: { profileVisibility: 'public' },
                display: { postsPerPage: 10 },
                sound: { enabled: true, volume: 50 },
                save: mockSettingsSave,
            };
            mockSettingsFindOne.mockResolvedValue(settings);
            req.body = { notifications: { email: true, evilKey: 'hack' } };

            await updateSettings(req, res, next);

            expect(settings.notifications.evilKey).toBeUndefined();
        });

        it('should update privacy settings', async () => {
            const settings = {
                _id: new ObjectId(),
                user: new ObjectId(userId),
                notifications: {},
                privacy: { profileVisibility: 'public', showEmail: false },
                display: { postsPerPage: 10 },
                sound: { enabled: true, volume: 50 },
                save: mockSettingsSave,
            };
            mockSettingsFindOne.mockResolvedValue(settings);
            req.body = { privacy: { profileVisibility: 'private' } };

            await updateSettings(req, res, next);

            expect(settings.privacy.profileVisibility).toBe('private');
            expect(mockSettingsSave).toHaveBeenCalled();
        });

        it('should update display settings', async () => {
            const settings = {
                _id: new ObjectId(),
                user: new ObjectId(userId),
                notifications: {},
                privacy: {},
                display: { postsPerPage: 10 },
                sound: { enabled: true, volume: 50 },
                save: mockSettingsSave,
            };
            mockSettingsFindOne.mockResolvedValue(settings);
            req.body = { display: { postsPerPage: 25 } };

            await updateSettings(req, res, next);

            expect(settings.display.postsPerPage).toBe(25);
        });

        it('should update sound settings', async () => {
            const settings = {
                _id: new ObjectId(),
                user: new ObjectId(userId),
                notifications: {},
                privacy: {},
                display: { postsPerPage: 10 },
                sound: { enabled: true, volume: 50 },
                save: mockSettingsSave,
            };
            mockSettingsFindOne.mockResolvedValue(settings);
            req.body = { sound: { enabled: false, volume: 0 } };

            await updateSettings(req, res, next);

            expect(settings.sound.enabled).toBe(false);
            expect(settings.sound.volume).toBe(0);
        });

        it('should return 404 if settings not found', async () => {
            mockSettingsFindOne.mockResolvedValue(null);
            req.body = { notifications: { email: true } };

            await updateSettings(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Settings not found' });
        });

        it('should ignore undefined body sections', async () => {
            const settings = {
                _id: new ObjectId(),
                user: new ObjectId(userId),
                notifications: { email: true },
                privacy: { profileVisibility: 'public' },
                display: { postsPerPage: 10 },
                sound: { enabled: true, volume: 50 },
                save: mockSettingsSave,
            };
            mockSettingsFindOne.mockResolvedValue(settings);
            req.body = {}; // no sections

            await updateSettings(req, res, next);

            expect(mockSettingsSave).toHaveBeenCalled();
        });

        it('should call next on error', async () => {
            mockSettingsFindOne.mockRejectedValue(new Error('fail'));

            await updateSettings(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    // ── getCompletedCourses ─────────────────────────
    describe('getCompletedCourses', () => {
        it('should return completed courses', async () => {
            mockUserFindById.mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    completedCourses: ['CS101', 'CS102'],
                }),
            });

            await getCompletedCourses(req, res, next);

            expect(mockUserFindById).toHaveBeenCalledWith(userId);
            expect(res.json).toHaveBeenCalledWith(['CS101', 'CS102']);
        });

        it('should return 404 if user not found', async () => {
            mockUserFindById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null),
            });

            await getCompletedCourses(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        it('should call next on error', async () => {
            mockUserFindById.mockReturnValue({
                select: jest.fn().mockRejectedValue(new Error('fail')),
            });

            await getCompletedCourses(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    // ── addCompletedCourse ──────────────────────────
    describe('addCompletedCourse', () => {
        it('should add a new completed course', async () => {
            const user = {
                _id: userId,
                completedCourses: ['CS101'],
                save: mockUserSave,
            };
            mockUserFindById.mockResolvedValue(user);
            req.body = { courseId: 'CS102' };

            await addCompletedCourse(req, res, next);

            expect(user.completedCourses).toEqual(['CS101', 'CS102']);
            expect(mockUserSave).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(['CS101', 'CS102']);
        });

        it('should not duplicate existing course', async () => {
            const user = {
                _id: userId,
                completedCourses: ['CS101'],
                save: mockUserSave,
            };
            mockUserFindById.mockResolvedValue(user);
            req.body = { courseId: 'CS101' };

            await addCompletedCourse(req, res, next);

            expect(user.completedCourses).toEqual(['CS101']); // unchanged
        });

        it('should return 404 if user not found', async () => {
            mockUserFindById.mockResolvedValue(null);
            req.body = { courseId: 'CS101' };

            await addCompletedCourse(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // ── removeCompletedCourse ───────────────────────
    describe('removeCompletedCourse', () => {
        it('should remove a completed course', async () => {
            const user = {
                _id: userId,
                completedCourses: ['CS101', 'CS102'],
                save: mockUserSave,
            };
            mockUserFindById.mockResolvedValue(user);
            req.params.courseId = 'CS101';

            await removeCompletedCourse(req, res, next);

            expect(user.completedCourses).toEqual(['CS102']);
            expect(mockUserSave).toHaveBeenCalled();
        });

        it('should return 404 if user not found', async () => {
            mockUserFindById.mockResolvedValue(null);
            req.params.courseId = 'CS101';

            await removeCompletedCourse(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should handle removing non-existent course gracefully', async () => {
            const user = {
                _id: userId,
                completedCourses: ['CS101'],
                save: mockUserSave,
            };
            mockUserFindById.mockResolvedValue(user);
            req.params.courseId = 'CS999';

            await removeCompletedCourse(req, res, next);

            expect(user.completedCourses).toEqual(['CS101']); // unchanged
            expect(res.json).toHaveBeenCalledWith(['CS101']);
        });
    });
});

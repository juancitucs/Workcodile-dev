const { ObjectId } = require('mongodb');

// ── Mocks ───────────────────────────────────────────
const mockUserFind = jest.fn();
const mockGetFileUrl = jest.fn();

jest.mock('../../models/User', () => {
    const fn = function () {};
    fn.find = mockUserFind;
    return fn;
});

jest.mock('../../services/storage/storage.service', () => ({
    getFileUrl: (...args) => mockGetFileUrl(...args),
}));

const { getTopUsers } = require('../../controllers/userController');

describe('User Controller', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { query: {}, params: {}, user: { id: new ObjectId().toString() } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        mockGetFileUrl.mockReturnValue('https://files.test.com/avatar.jpg');
    });

    // ── getTopUsers ─────────────────────────────────
    describe('getTopUsers', () => {
        const makeUsers = (count) =>
            Array.from({ length: count }, (_, i) => ({
                _id: new ObjectId(),
                name: `User ${i + 1}`,
                avatar_key: i === 0 ? null : `avatars/user${i}.jpg`,
                level: count - i,
                xp: (count - i) * 100,
                stats: {
                    totalPosts: i * 3,
                    totalLikesReceived: i * 5,
                },
            }));

        it('should return top users by XP', async () => {
            const users = makeUsers(3);
            mockGetFileUrl.mockReturnValue('https://files.test.com/avatar.jpg');
            mockUserFind.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValue(users),
            });

            await getTopUsers(req, res, next);

            expect(mockUserFind).toHaveBeenCalledWith({ isVerified: true });
            expect(res.json).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ name: 'User 1', xp: 300 }),
                ]),
            );
        });

        it('should use default limit of 10', async () => {
            mockUserFind.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValue([]),
            });

            await getTopUsers(req, res, next);

            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('should parse custom limit from query', async () => {
            req.query.limit = '5';
            let capturedLimit;
            mockUserFind.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockImplementation((l) => {
                    capturedLimit = l;
                    return { select: jest.fn().mockResolvedValue([]) };
                }),
                select: jest.fn(),
            });

            await getTopUsers(req, res, next);

            expect(capturedLimit).toBe(5);
        });

        it('should return null avatar for users without avatar_key', async () => {
            const userNoAvatar = {
                _id: new ObjectId(),
                name: 'No Avatar',
                avatar_key: null,
                level: 1,
                xp: 100,
                stats: { totalPosts: 0, totalLikesReceived: 0 },
            };
            mockUserFind.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValue([userNoAvatar]),
            });

            await getTopUsers(req, res, next);

            const result = res.json.mock.calls[0][0];
            expect(result[0].avatar).toBeNull();
        });

        it('should call next on error', async () => {
            mockUserFind.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                select: jest.fn().mockRejectedValue(new Error('fail')),
            });

            await getTopUsers(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });
});

const { ObjectId } = require('mongodb');

// ── Mocks ───────────────────────────────────────────
const mockNotificationFind = jest.fn();
const mockNotificationFindById = jest.fn();
const mockNotificationUpdateMany = jest.fn();
const mockNotifSave = jest.fn();

jest.mock('../models/Notification', () => {
    const MockNotification = function (data) {
        Object.assign(this, data);
        this.save = mockNotifSave;
    };
    MockNotification.find = mockNotificationFind;
    MockNotification.findById = mockNotificationFindById;
    MockNotification.updateMany = mockNotificationUpdateMany;
    return MockNotification;
});

const {
    getNotifications,
    markAsRead,
    markAllAsRead,
} = require('../controllers/notificationController');

describe('Notification Controller', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: {},
            body: {},
            user: { id: new ObjectId().toString() },
        };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        mockNotifSave.mockResolvedValue(true);
    });

    // ── getNotifications ────────────────────────────
    describe('getNotifications', () => {
        it('should return notifications sorted by createdAt desc', async () => {
            const notifications = [
                { _id: new ObjectId(), text: 'First', createdAt: new Date('2024-01-02') },
                { _id: new ObjectId(), text: 'Second', createdAt: new Date('2024-01-01') },
            ];
            mockNotificationFind.mockReturnValue({
                sort: jest.fn().mockResolvedValue(notifications),
            });

            await getNotifications(req, res, next);

            expect(mockNotificationFind).toHaveBeenCalledWith({ user: req.user.id });
            expect(res.json).toHaveBeenCalledWith(notifications);
        });

        it('should call next on error', async () => {
            const error = new Error('DB fail');
            mockNotificationFind.mockReturnValue({
                sort: jest.fn().mockRejectedValue(error),
            });

            await getNotifications(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    // ── markAsRead ──────────────────────────────────
    describe('markAsRead', () => {
        it('should mark a notification as read', async () => {
            const notification = {
                _id: new ObjectId(),
                user: new ObjectId(req.user.id),
                read: false,
                save: mockNotifSave,
            };
            mockNotificationFindById.mockResolvedValue(notification);
            req.params.id = notification._id.toString();

            await markAsRead(req, res, next);

            expect(notification.read).toBe(true);
            expect(mockNotifSave).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(notification);
        });

        it('should return 404 if not found', async () => {
            mockNotificationFindById.mockResolvedValue(null);
            req.params.id = new ObjectId().toString();

            await markAsRead(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Notification not found' });
        });

        it('should return 403 if not the owner', async () => {
            const notification = {
                _id: new ObjectId(),
                user: new ObjectId(), // different user
                read: false,
            };
            mockNotificationFindById.mockResolvedValue(notification);
            req.params.id = notification._id.toString();

            await markAsRead(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not authorized' });
        });

        it('should call next on error', async () => {
            mockNotificationFindById.mockRejectedValue(new Error('fail'));
            req.params.id = new ObjectId().toString();

            await markAsRead(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    // ── markAllAsRead ───────────────────────────────
    describe('markAllAsRead', () => {
        it('should mark all notifications as read for the user', async () => {
            mockNotificationUpdateMany.mockResolvedValue({ modifiedCount: 5 });

            await markAllAsRead(req, res, next);

            expect(mockNotificationUpdateMany).toHaveBeenCalledWith(
                { user: req.user.id, read: false },
                { $set: { read: true } },
            );
            expect(res.json).toHaveBeenCalledWith({
                message: 'All notifications marked as read',
            });
        });

        it('should call next on error', async () => {
            mockNotificationUpdateMany.mockRejectedValue(new Error('fail'));

            await markAllAsRead(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });
});

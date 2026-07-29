const { ObjectId } = require('mongodb');
const path = require('path');

// ── Mocks ───────────────────────────────────────────
const mockUploadFile = jest.fn();
const mockDeleteFile = jest.fn();
const mockGetFileStream = jest.fn();
const mockMulterSingle = jest.fn(() => (req, _res, next) => {
    // Simulate multer attaching the file
    if (req.body.simulateFile) {
        req.file = {
            originalname: req.body.simulateFile.name || 'test.jpg',
            buffer: Buffer.from('fake-image-data'),
            mimetype: req.body.simulateFile.mimetype || 'image/jpeg',
            size: req.body.simulateFile.size || 1024,
        };
    }
    next();
});

const mockMemoryStorage = jest.fn(() => ({}));
jest.mock('multer', () => {
    const fn = () => ({
        single: mockMulterSingle,
    });
    fn.memoryStorage = mockMemoryStorage;
    return fn;
});

jest.mock('../services/storage/storage.service', () => ({
    uploadFile: (...args) => mockUploadFile(...args),
    deleteFile: (...args) => mockDeleteFile(...args),
    getFileStream: (...args) => mockGetFileStream(...args),
}));

const {
    uploadMiddleware,
    uploadHandler,
    getFileHandler,
    deleteHandler,
} = require('../controllers/storageController');

describe('Storage Controller', () => {
    let req, res, next;
    const userId = new ObjectId().toString();

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: {},
            body: {},
            user: { id: userId },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn(),
        };
        next = jest.fn();
        mockUploadFile.mockResolvedValue('https://storage.test.com/file.jpg');
        mockDeleteFile.mockResolvedValue(true);
    });

    // ── uploadHandler ───────────────────────────────
    describe('uploadHandler', () => {
        it('should upload a file and return 201', async () => {
            req.file = {
                originalname: 'photo.jpg',
                buffer: Buffer.from('data'),
                mimetype: 'image/jpeg',
            };

            await uploadHandler(req, res, next);

            expect(mockUploadFile).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ objectName: expect.any(String), url: expect.any(String) }),
            );
        });

        it('should sanitize filename characters', async () => {
            req.file = {
                originalname: 'bad<file>.jpg',
                buffer: Buffer.from('data'),
                mimetype: 'image/jpeg',
            };

            await uploadHandler(req, res, next);

            // The filename should not contain < >
            const callArg = mockUploadFile.mock.calls[0][0];
            expect(callArg).not.toContain('<');
            expect(callArg).not.toContain('>');
        });

        it('should return 400 if no file provided', async () => {
            req.file = undefined;

            await uploadHandler(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'No file provided.' });
        });

        it('should call next on error', async () => {
            req.file = {
                originalname: 'photo.jpg',
                buffer: Buffer.from('data'),
                mimetype: 'image/jpeg',
            };
            mockUploadFile.mockRejectedValue(new Error('upload fail'));

            await uploadHandler(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    // ── getFileHandler ──────────────────────────────
    describe('getFileHandler', () => {
        it('should stream a file', async () => {
            const stream = { pipe: jest.fn() };
            mockGetFileStream.mockResolvedValue(stream);
            req.params.name = 'user123-1234567890-photo.jpg';

            await getFileHandler(req, res, next);

            expect(mockGetFileStream).toHaveBeenCalled();
            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Disposition',
                expect.stringContaining('photo.jpg'),
            );
            expect(stream.pipe).toHaveBeenCalledWith(res);
        });

        it('should sanitize filename in params', async () => {
            const stream = { pipe: jest.fn() };
            mockGetFileStream.mockResolvedValue(stream);
            req.params.name = 'user123-1234567890-bad<script>.jpg';

            await getFileHandler(req, res, next);

            const safeArg = mockGetFileStream.mock.calls[0][0];
            expect(safeArg).not.toContain('<');
            expect(safeArg).not.toContain('>');
        });

        it('should call next on error', async () => {
            mockGetFileStream.mockRejectedValue(new Error('not found'));
            req.params.name = 'user123-1234567890-photo.jpg';

            await getFileHandler(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    // ── deleteHandler ───────────────────────────────
    describe('deleteHandler', () => {
        it('should delete own file', async () => {
            req.params.name = `${userId}-1234567890-photo.jpg`;

            await deleteHandler(req, res, next);

            expect(mockDeleteFile).toHaveBeenCalledWith(req.params.name);
            expect(res.json).toHaveBeenCalledWith({ message: 'File deleted successfully.' });
        });

        it('should return 400 if name contains path traversal', async () => {
            req.params.name = '../../../etc/passwd';

            await deleteHandler(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid file name.' });
        });

        it('should return 403 if not the file owner', async () => {
            req.params.name = `otheruser-1234567890-photo.jpg`;

            await deleteHandler(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized to delete this file.' });
        });

        it('should call next on error', async () => {
            mockDeleteFile.mockRejectedValue(new Error('fail'));
            req.params.name = `${userId}-1234567890-photo.jpg`;

            await deleteHandler(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    // ── uploadMiddleware ────────────────────────────
    describe('uploadMiddleware', () => {
        it('should be a middleware function', () => {
            expect(typeof uploadMiddleware).toBe('function');
        });
    });
});

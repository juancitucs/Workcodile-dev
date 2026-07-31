const { ObjectId } = require('mongodb');

// ── Mocks ───────────────────────────────────────────
const mockCourseFind = jest.fn();

jest.mock('../../models/Course', () => {
    const fn = function () {};
    fn.find = mockCourseFind;
    return fn;
});

const { getAllCourses } = require('../../controllers/courseController');

describe('Course Controller', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { query: {}, params: {}, user: { id: new ObjectId().toString() } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    // ── getAllCourses ───────────────────────────────
    describe('getAllCourses', () => {
        it('should return all courses sorted by cycle and _id', async () => {
            const courses = [
                { _id: 'CS101', name: 'CS 101', cycle: 1 },
                { _id: 'CS102', name: 'CS 102', cycle: 2 },
            ];
            mockCourseFind.mockReturnValue({
                sort: jest.fn().mockResolvedValue(courses),
            });

            await getAllCourses(req, res, next);

            expect(mockCourseFind).toHaveBeenCalledWith({});
            expect(res.json).toHaveBeenCalledWith(courses);
        });

        it('should return empty array if no courses', async () => {
            mockCourseFind.mockReturnValue({
                sort: jest.fn().mockResolvedValue([]),
            });

            await getAllCourses(req, res, next);

            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('should call next on error', async () => {
            mockCourseFind.mockReturnValue({
                sort: jest.fn().mockRejectedValue(new Error('fail')),
            });

            await getAllCourses(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });
});

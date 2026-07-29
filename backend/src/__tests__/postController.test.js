const { ObjectId } = require('mongodb');

// ── Helpers ─────────────────────────────────────────
const USER_ID = new ObjectId();
const OTHER_USER_ID = new ObjectId();
const AUTHOR_ID = new ObjectId('000000000000000000000001');
const POST_ID = new ObjectId();
const POST_ID_STR = POST_ID.toString();

// ── Mocks ───────────────────────────────────────────
const mockPostService = {
    getPaginatedPosts: jest.fn(),
    getAggregatedPost: jest.fn(),
    addUrlsToItems: jest.fn(),
    sortComments: jest.fn(),
    addUserVoteStatus: jest.fn(),
    createPostDocument: jest.fn(),
    handleVote: jest.fn(),
    findCommentRecursive: jest.fn(),
    populateAuthors: jest.fn(),
};
jest.mock('../services/post.service', () => mockPostService);

const mockXpService = { addXP: jest.fn() };
jest.mock('../services/xpService', () => mockXpService);

const mockUserFindById = jest.fn();
const mockUserUpdateOne = jest.fn();
jest.mock('../models/User', () => {
    const fn = function () {};
    fn.findById = (...args) => mockUserFindById(...args);
    fn.updateOne = (...args) => mockUserUpdateOne(...args);
    return fn;
});

const mockNotifCreate = jest.fn();
jest.mock('../models/Notification', () => ({ create: (...args) => mockNotifCreate(...args) }));

const mockReportCreate = jest.fn();
jest.mock('../models/Report', () => ({ create: (...args) => mockReportCreate(...args) }));

const mockUpdateOne = jest.fn();
const mockFindOne = jest.fn();
const mockFindOneAndUpdate = jest.fn();
const mockFindOneAndDelete = jest.fn();

const mockCollection = jest.fn(() => ({
    findOne: mockFindOne,
    updateOne: mockUpdateOne,
    findOneAndUpdate: mockFindOneAndUpdate,
    findOneAndDelete: mockFindOneAndDelete,
}));

jest.mock('mongoose', () => ({
    connection: { db: { collection: mockCollection } },
    Types: { ObjectId: require('mongodb').ObjectId },
}));

const {
    getAllPosts, getPostById, getPostByCommentId, getCommentReplies,
    createPost, updatePost, deletePost,
    votePost, addCommentToPost, voteComment,
    bookmarkPost, reportPost, incrementView,
} = require('../controllers/postController');

describe('Post Controller', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { params: {}, query: {}, body: {}, user: { id: USER_ID.toString() } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();

        mockPostService.addUrlsToItems.mockReturnValue(undefined);
        mockPostService.sortComments.mockReturnValue(undefined);
        mockPostService.addUserVoteStatus.mockReturnValue(undefined);
        mockPostService.handleVote.mockResolvedValue({ voteAdded: true });
        mockPostService.getAggregatedPost.mockResolvedValue({
            _id: POST_ID_STR, title: 'Test', author: AUTHOR_ID, comments: [],
        });
        mockPostService.createPostDocument.mockResolvedValue('newPostId');
        mockPostService.findCommentRecursive.mockReturnValue({
            _id: new ObjectId(), author: AUTHOR_ID, content: 'found',
            upvoted_by: [], downvoted_by: [], replies: [],
        });
        mockPostService.populateAuthors.mockResolvedValue(undefined);

        mockUserFindById.mockResolvedValue({
            _id: USER_ID, name: 'Test User', bookmarked_posts: [],
            toString: () => USER_ID.toString(),
        });
        mockNotifCreate.mockResolvedValue({});
        mockReportCreate.mockResolvedValue({});
        mockFindOne.mockResolvedValue({
            _id: POST_ID, author: AUTHOR_ID, title: 'Post',
            comments: [], viewed_by: [],
        });
    });

    // ── getAllPosts ─────────────────────────────────
    describe('getAllPosts', () => {
        it('should return paginated posts', async () => {
            mockPostService.getPaginatedPosts.mockResolvedValue({
                posts: [{ _id: POST_ID_STR }], totalPages: 2, hasNextPage: true,
            });
            await getAllPosts(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ posts: expect.any(Array) }),
            );
        });

        it('should parse page and limit from query', async () => {
            req.query = { page: '2', limit: '5' };
            await getAllPosts(req, res, next);
            expect(mockPostService.getPaginatedPosts).toHaveBeenCalledWith(2, 5);
        });

        it('should call next on error', async () => {
            mockPostService.getPaginatedPosts.mockRejectedValue(new Error('DB fail'));
            await getAllPosts(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

    // ── getPostById ─────────────────────────────────
    describe('getPostById', () => {
        it('should return a post by id', async () => {
            req.params.id = POST_ID_STR;
            mockPostService.getAggregatedPost.mockResolvedValue({
                _id: POST_ID_STR, title: 'Test',
                comments: [{ _id: 'c1', score: 5 }], author: AUTHOR_ID,
            });
            await getPostById(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if not found', async () => {
            mockPostService.getAggregatedPost.mockResolvedValue(null);
            await getPostById(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should slice comments by offset and limit', async () => {
            req.params.id = POST_ID_STR;
            req.query = { commentLimit: '2', commentOffset: '1' };
            mockPostService.getAggregatedPost.mockResolvedValue({
                _id: POST_ID_STR,
                comments: [
                    { _id: 'c1', score: 1 },
                    { _id: 'c2', score: 2 },
                    { _id: 'c3', score: 3 },
                ],
                author: AUTHOR_ID,
            });
            await getPostById(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    // ── createPost ──────────────────────────────────
    describe('createPost', () => {
        it('should create a post and return 201', async () => {
            req.body = { title: 'New Post', content: 'Content', course: 'CS101', hashtags: ['test'] };
            mockPostService.getAggregatedPost.mockResolvedValue({
                _id: POST_ID_STR, title: 'New Post', author: USER_ID,
            });
            await createPost(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should call next on error', async () => {
            mockPostService.createPostDocument.mockRejectedValue(new Error('fail'));
            await createPost(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

    // ── updatePost ──────────────────────────────────
    describe('updatePost', () => {
        it('should update and return the post', async () => {
            req.params.id = POST_ID_STR;
            req.body = { title: 'Updated', content: 'Updated content' };
            mockFindOne.mockResolvedValue({
                _id: POST_ID, author: USER_ID,
            });
            mockFindOneAndUpdate.mockResolvedValue({});
            mockPostService.getAggregatedPost.mockResolvedValue({
                _id: POST_ID_STR, title: 'Updated', author: USER_ID,
            });
            await updatePost(req, res, next);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if post not found', async () => {
            req.params.id = POST_ID_STR;
            req.body = { title: 'Updated', content: 'Updated content' };
            mockFindOne.mockResolvedValue(null);
            await updatePost(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 403 if not the author', async () => {
            req.params.id = POST_ID_STR;
            req.body = { title: 'Updated', content: 'Updated content' };
            mockFindOne.mockResolvedValue({
                _id: POST_ID, author: OTHER_USER_ID,
            });
            await updatePost(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    // ── deletePost ──────────────────────────────────
    describe('deletePost', () => {
        it('should delete own post', async () => {
            req.params.id = POST_ID_STR;
            mockFindOne.mockResolvedValue({
                _id: POST_ID, author: USER_ID,
            });
            await deletePost(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Post deleted successfully' });
        });

        it('should return 404 if not found', async () => {
            req.params.id = POST_ID_STR;
            mockFindOne.mockResolvedValue(null);
            await deletePost(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 403 for other user post', async () => {
            req.params.id = POST_ID_STR;
            mockFindOne.mockResolvedValue({
                _id: POST_ID, author: OTHER_USER_ID,
            });
            await deletePost(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    // ── votePost ────────────────────────────────────
    describe('votePost', () => {
        it('should upvote a post', async () => {
            req.params.id = POST_ID_STR;
            req.body = { vote: 'up' };
            mockFindOne.mockResolvedValue({
                _id: POST_ID, author: OTHER_USER_ID, title: 'Test',
            });
            await votePost(req, res, next);
            expect(mockPostService.handleVote).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if post not found', async () => {
            req.params.id = POST_ID_STR;
            mockFindOne.mockResolvedValue(null);
            await votePost(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // ── addCommentToPost ────────────────────────────
    describe('addCommentToPost', () => {
        it('should add a comment to a post', async () => {
            req.params.id = POST_ID_STR;
            req.body = { content: 'Great post!' };
            await addCommentToPost(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should add a reply to a parent comment', async () => {
            req.params.id = POST_ID_STR;
            req.body = { content: 'Reply!', parentId: new ObjectId().toString() };
            mockPostService.findCommentRecursive.mockReturnValue({
                _id: new ObjectId(), replies: [],
            });
            await addCommentToPost(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if parent not found', async () => {
            req.params.id = POST_ID_STR;
            req.body = { content: 'Reply!', parentId: new ObjectId().toString() };
            mockPostService.findCommentRecursive.mockReturnValue(null);
            await addCommentToPost(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // ── voteComment ─────────────────────────────────
    describe('voteComment', () => {
        it('should upvote a top-level comment', async () => {
            const commentId = new ObjectId();
            req.params = { postId: POST_ID_STR, commentId: commentId.toString() };
            req.body = { vote: 'up' };
            mockFindOne.mockResolvedValue({
                _id: POST_ID,
                comments: [{
                    _id: commentId, author: OTHER_USER_ID,
                    upvoted_by: [], downvoted_by: [],
                }],
            });
            mockPostService.findCommentRecursive.mockReturnValue({
                _id: commentId, author: OTHER_USER_ID,
                upvoted_by: [], downvoted_by: [],
            });
            await voteComment(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 for invalid vote type', async () => {
            req.params = { postId: POST_ID_STR, commentId: new ObjectId().toString() };
            req.body = { vote: 'invalid' };
            await voteComment(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if comment not found', async () => {
            mockPostService.findCommentRecursive.mockReturnValue(null);
            req.params = { postId: POST_ID_STR, commentId: new ObjectId().toString() };
            req.body = { vote: 'up' };
            await voteComment(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should handle downvote on comment', async () => {
            const commentId = new ObjectId();
            req.params = { postId: POST_ID_STR, commentId: commentId.toString() };
            req.body = { vote: 'down' };
            mockFindOne.mockResolvedValue({
                _id: POST_ID,
                comments: [{
                    _id: commentId, author: OTHER_USER_ID,
                    upvoted_by: [], downvoted_by: [],
                }],
            });
            mockPostService.findCommentRecursive.mockReturnValue({
                _id: commentId, author: OTHER_USER_ID,
                upvoted_by: [], downvoted_by: [],
            });
            await voteComment(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    // ── bookmarkPost ────────────────────────────────
    describe('bookmarkPost', () => {
        it('should bookmark a post', async () => {
            req.params.id = POST_ID_STR;
            mockUserFindById.mockResolvedValue({
                _id: USER_ID, bookmarked_posts: [],
                toString: () => USER_ID.toString(),
            });
            await bookmarkPost(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ bookmarked: true });
        });

        it('should toggle off bookmark if already bookmarked', async () => {
            req.params.id = POST_ID_STR;
            mockUserFindById.mockResolvedValue({
                _id: USER_ID, bookmarked_posts: [POST_ID],
                toString: () => USER_ID.toString(),
            });
            await bookmarkPost(req, res, next);
            expect(res.json).toHaveBeenCalledWith({ bookmarked: false });
        });

        it('should return 404 if user not found', async () => {
            req.params.id = POST_ID_STR;
            mockUserFindById.mockResolvedValue(null);
            await bookmarkPost(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // ── reportPost ──────────────────────────────────
    describe('reportPost', () => {
        it('should report a post', async () => {
            req.params.id = POST_ID_STR;
            req.body = { reason: 'Spam' };
            await reportPost(req, res, next);
            expect(mockReportCreate).toHaveBeenCalledWith(
                expect.objectContaining({ reason: 'Spam' }),
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should report with default reason', async () => {
            req.params.id = POST_ID_STR;
            req.body = {};
            await reportPost(req, res, next);
            expect(mockReportCreate).toHaveBeenCalledWith(
                expect.objectContaining({ reason: 'No reason provided' }),
            );
        });
    });

    // ── incrementView ───────────────────────────────
    describe('incrementView', () => {
        it('should increment view count', async () => {
            req.params.id = POST_ID_STR;
            await incrementView(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should record view for anonymous user', async () => {
            req.params.id = POST_ID_STR;
            req.user = null;
            await incrementView(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return already recorded if viewed', async () => {
            req.params.id = POST_ID_STR;
            const uid = new ObjectId('000000000000000000000001');
            req.user = { id: uid.toString() };
            mockFindOne.mockResolvedValue({
                _id: POST_ID, viewed_by: [uid],
            });
            await incrementView(req, res, next);
            expect(res.json).toHaveBeenCalledWith({ message: 'View already recorded' });
        });

        it('should return 404 if post not found (auth user)', async () => {
            req.params.id = POST_ID_STR;
            const uid = new ObjectId('000000000000000000000001');
            req.user = { id: uid.toString() };
            mockFindOne.mockResolvedValue(null);
            await incrementView(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // ── getPostByCommentId ──────────────────────────
    describe('getPostByCommentId', () => {
        it('should find post by comment id', async () => {
            req.params.commentId = new ObjectId().toString();
            mockFindOne.mockResolvedValue({ _id: POST_ID, comments: [] });
            await getPostByCommentId(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if not found', async () => {
            req.params.commentId = new ObjectId().toString();
            mockFindOne.mockResolvedValue(null);
            await getPostByCommentId(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // ── getCommentReplies ───────────────────────────
    describe('getCommentReplies', () => {
        const commentId = new ObjectId();

        it('should return replies for a comment', async () => {
            req.params = { postId: POST_ID_STR, commentId: commentId.toString() };
            mockPostService.findCommentRecursive.mockReturnValue({
                _id: commentId, author: AUTHOR_ID, replies: [],
            });
            await getCommentReplies(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if post not found', async () => {
            mockFindOne.mockResolvedValue(null);
            req.params = { postId: POST_ID_STR, commentId: commentId.toString() };
            await getCommentReplies(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 404 if comment not found', async () => {
            mockPostService.findCommentRecursive.mockReturnValue(null);
            req.params = { postId: POST_ID_STR, commentId: commentId.toString() };
            await getCommentReplies(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});

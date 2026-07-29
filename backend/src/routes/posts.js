const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const post = require('../controllers/postController');
const auth = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuthMiddleware');
const validate = require('../middleware/validate');
const {
    createPost,
    updatePost,
    votePost,
    addComment,
    voteComment,
    postId,
    postIdCommentId,
} = require('../validators/post.validator');

const commentIdParam = [param('commentId').isMongoId().withMessage('Invalid comment ID')];

router.get('/', optionalAuth, post.getAllPosts);
router.get('/:id', optionalAuth, postId, validate, post.getPostById);
router.get(
    '/by-comment/:commentId',
    optionalAuth,
    commentIdParam,
    validate,
    post.getPostByCommentId,
);
router.get(
    '/:postId/comments/:commentId/replies',
    optionalAuth,
    postIdCommentId,
    validate,
    post.getCommentReplies,
);
router.post('/', auth, createPost, validate, post.createPost);
router.put('/:id', auth, postId, updatePost, validate, post.updatePost);
router.delete('/:id', auth, postId, validate, post.deletePost);
router.post('/:id/vote', auth, postId, votePost, validate, post.votePost);
router.post('/:id/bookmark', auth, postId, validate, post.bookmarkPost);
router.post('/:id/report', auth, postId, validate, post.reportPost);
router.post('/:id/view', optionalAuth, postId, validate, post.incrementView);
router.post('/:id/comments', auth, postId, addComment, validate, post.addCommentToPost);
router.post(
    '/:postId/comments/:commentId/vote',
    auth,
    postIdCommentId,
    voteComment,
    validate,
    post.voteComment,
);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  getPostByCommentId,
  getCommentReplies,
  createPost,
  votePost,
  addCommentToPost,
  voteComment,
  bookmarkPost,
  reportPost,
  incrementView,
  downloadAttachment,
} = require('../controllers/postController');
const auth = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuthMiddleware');

router.get('/', optionalAuth, getAllPosts);
router.get('/:id', optionalAuth, getPostById);
router.get('/by-comment/:commentId', optionalAuth, getPostByCommentId);
router.get('/attachment/:object_key', downloadAttachment);
router.get('/:postId/comments/:commentId/replies', optionalAuth, getCommentReplies);
router.post('/', auth, createPost);
router.post('/:id/vote', auth, votePost);
router.post('/:id/bookmark', auth, bookmarkPost);
router.post('/:id/report', auth, reportPost);
router.post('/:id/view', incrementView);
router.post('/:id/comments', auth, addCommentToPost);
router.post('/:postId/comments/:commentId/vote', auth, voteComment);

module.exports = router;
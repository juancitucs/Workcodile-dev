const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  createPost,
  votePost,
  addCommentToPost,
  voteComment,
  ratePost,
  bookmarkPost,
  reportPost,
  incrementView,
  downloadAttachment,
} = require('../controllers/postController');
const auth = require('../middleware/authMiddleware');

router.get('/', getAllPosts);
router.get('/attachment/:object_key', downloadAttachment);
router.post('/', auth, createPost);
router.post('/:id/vote', auth, votePost);
router.post('/:id/rate', auth, ratePost);
router.post('/:id/bookmark', auth, bookmarkPost);
router.post('/:id/report', auth, reportPost);
router.post('/:id/view', incrementView);
router.post('/:id/comments', auth, addCommentToPost);
router.post('/:postId/comments/:commentId/vote', auth, voteComment);

module.exports = router;

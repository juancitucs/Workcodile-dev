const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  createPost,
  votePost,
  addCommentToPost,
  voteComment,
} = require('../controllers/postController');
const auth = require('../middleware/authMiddleware');

router.get('/', getAllPosts);
router.post('/', auth, createPost);
router.post('/:id/vote', auth, votePost);
router.post('/:id/comments', auth, addCommentToPost);
router.post('/:postId/comments/:commentId/vote', auth, voteComment);

module.exports = router;

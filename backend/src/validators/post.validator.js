const { body, param, query } = require('express-validator');

const createPost = [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('content').trim().notEmpty().withMessage('Content is required').isLength({ max: 10000 }),
    body('course').trim().notEmpty().withMessage('Course is required'),
    body('hashtags').optional().isArray(),
    body('attachments').optional().isArray(),
];

const updatePost = [
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('content').trim().notEmpty().isLength({ max: 10000 }),
];

const votePost = [body('vote').isIn(['up', 'down']).withMessage('Vote must be up or down')];

const addComment = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Comment content is required')
        .isLength({ max: 5000 }),
    body('parentId').optional().isMongoId().withMessage('Invalid parent comment ID'),
    body('attachments').optional().isArray(),
];

const voteComment = [body('vote').isIn(['up', 'down']).withMessage('Vote must be up or down')];

const pagination = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];

const postId = [param('id').isMongoId().withMessage('Invalid post ID')];

const postIdCommentId = [
    param('postId').isMongoId().withMessage('Invalid post ID'),
    param('commentId').isMongoId().withMessage('Invalid comment ID'),
];

module.exports = {
    createPost,
    updatePost,
    votePost,
    addComment,
    voteComment,
    pagination,
    postId,
    postIdCommentId,
};

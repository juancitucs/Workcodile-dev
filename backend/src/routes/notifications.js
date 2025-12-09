const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

// @route   GET api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, getNotifications);

// @route   PUT api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, markAsRead);

module.exports = router;

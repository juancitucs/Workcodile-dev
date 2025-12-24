const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// @route   GET api/users/top
// @desc    Get top users by experience points (XP)
// @access  Private
router.get('/top', userController.getTopUsers);

module.exports = router;

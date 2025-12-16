const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// @route   GET api/users/top
// @desc    Get top users by experience points (XP)
// @access  Public
router.get('/top', userController.getTopUsers);

module.exports = router;

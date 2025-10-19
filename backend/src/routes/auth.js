const express = require('express');
const router = express.Router();
const { register, login, getMe, updateUserTheme } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET api/auth/me
// @desc    Get user data
// @access  Private
router.get('/me', authMiddleware, getMe);

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   PUT api/auth/user/theme
// @desc    Update user theme
// @access  Private
router.put('/user/theme', authMiddleware, updateUserTheme);

module.exports = router;

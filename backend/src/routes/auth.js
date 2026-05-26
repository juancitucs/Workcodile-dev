const express = require('express');
const router = express.Router();
const { sendVerificationCode, verifyAndRegister, login, getMe, updateUserTheme, updateProfile, getUserById, forgotPassword, resetPassword } = require('../controllers/authController.js');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET api/auth/me
// @desc    Get user data
// @access  Private
router.get('/me', authMiddleware, getMe);

// @route   PUT api/auth/me
// @desc    Update user profile
// @access  Private
router.put('/me', authMiddleware, updateProfile);

// @route   GET api/auth/user/:id
// @desc    Get user by ID
// @access  Public
router.get('/user/:id', getUserById);

// @route   POST api/auth/send-verification-code
// @desc    Send verification code for registration
// @access  Public
router.post('/send-verification-code', sendVerificationCode);

// @route   POST api/auth/verify-and-register
// @desc    Verify code and register user
// @access  Public
router.post('/verify-and-register', verifyAndRegister);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   PUT api/auth/user/theme
// @desc    Update user theme
// @access  Private
router.put('/user/theme', authMiddleware, updateUserTheme);

// @route   POST api/auth/forgot-password
// @desc    Send password reset code
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   POST api/auth/reset-password
// @desc    Reset password with code
// @access  Public
router.post('/reset-password', resetPassword);

module.exports = router;

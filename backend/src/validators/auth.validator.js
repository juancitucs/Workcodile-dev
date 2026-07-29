const { body } = require('express-validator');

const register = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const login = [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];

const verifyCode = [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('verificationCode')
        .isLength({ min: 6, max: 6 })
        .withMessage('Verification code must be 6 digits'),
];

const forgotPassword = [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const resetPassword = [
    body('code').isLength({ min: 6, max: 6 }).withMessage('Reset code must be 6 digits'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const updateProfile = [
    body('name').optional().trim().notEmpty().isLength({ max: 100 }),
    body('bio').optional().trim().isLength({ max: 500 }),
    body('interests').optional().isArray(),
    body('socialLinks').optional().isArray(),
];

const updateTheme = [
    body('theme').isIn(['light', 'dark']).withMessage('Theme must be light or dark'),
];

module.exports = {
    register,
    login,
    verifyCode,
    forgotPassword,
    resetPassword,
    updateProfile,
    updateTheme,
};

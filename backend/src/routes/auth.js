const express = require('express')
const router = express.Router()
const auth = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')
const validate = require('../middleware/validate')
const { register, login, verifyCode, forgotPassword, resetPassword, updateProfile, updateTheme } = require('../validators/auth.validator')

router.get('/me', authMiddleware, auth.getMe)
router.put('/me', authMiddleware, updateProfile, validate, auth.updateProfile)
router.get('/user/:id', auth.getUserById)
router.post('/send-verification-code', register, validate, auth.sendVerificationCode)
router.post('/verify-and-register', verifyCode, validate, auth.verifyAndRegister)
router.post('/login', login, validate, auth.login)
router.put('/user/theme', authMiddleware, updateTheme, validate, auth.updateUserTheme)
router.post('/forgot-password', forgotPassword, validate, auth.forgotPassword)
router.post('/reset-password', resetPassword, validate, auth.resetPassword)

module.exports = router
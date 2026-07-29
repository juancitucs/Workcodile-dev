const express = require('express')
const router = express.Router()
const { param } = require('express-validator')
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController')
const auth = require('../middleware/authMiddleware')
const validate = require('../middleware/validate')

const notifIdParam = [param('id').isMongoId().withMessage('Invalid notification ID')]

router.get('/', auth, getNotifications)
router.put('/read/all', auth, markAllAsRead)
router.put('/:id/read', auth, notifIdParam, validate, markAsRead)

module.exports = router
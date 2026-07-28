const express = require('express')
const router = express.Router()
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController')
const auth = require('../middleware/authMiddleware')

router.get('/', auth, getNotifications)
router.put('/read/all', auth, markAllAsRead)
router.put('/:id/read', auth, markAsRead)

module.exports = router
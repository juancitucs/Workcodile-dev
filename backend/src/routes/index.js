const express = require('express');
const router = express.Router();

const postRoutes = require('./posts');
const healthRoutes = require('./health');
const authRoutes = require('./auth');
const notificationRoutes = require('./notifications');
const settingsRoutes = require('./settings');
const storageRoutes = require('./storage');
const courseRoutes = require('./courses');

router.use('/posts', postRoutes);
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingsRoutes);
router.use('/storage', storageRoutes);
router.use('/courses', courseRoutes);

module.exports = router;

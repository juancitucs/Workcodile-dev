const express = require('express');
const router = express.Router();

const postRoutes = require('./posts');
const healthRoutes = require('./health');
const authRoutes = require('./auth');

const storageRoutes = require('./storage');

router.use('/posts', postRoutes);
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/storage', storageRoutes);

module.exports = router;

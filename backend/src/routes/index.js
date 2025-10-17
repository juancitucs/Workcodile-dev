const express = require('express');
const router = express.Router();

const postRoutes = require('./posts');
const healthRoutes = require('./health');
const authRoutes = require('./auth');

router.use('/posts', postRoutes);
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

module.exports = router;

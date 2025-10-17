const express = require('express');
const router = express.Router();

const postRoutes = require('./posts');
const healthRoutes = require('./health');

router.use('/posts', postRoutes);
router.use('/', healthRoutes);

module.exports = router;

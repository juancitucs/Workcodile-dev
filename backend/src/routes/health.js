const express = require('express');
const router = express.Router();
const { healthCheck, dbStatus } = require('../controllers/healthController');

router.get('/health', healthCheck);
router.get('/db-status', dbStatus);

module.exports = router;

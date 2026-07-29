const express = require('express');
const router = express.Router();
const { healthCheck, dbStatus } = require('../controllers/healthController');

router.get('/', healthCheck);
router.get('/db-status', dbStatus);

module.exports = router;

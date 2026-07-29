const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/top', userController.getTopUsers);

module.exports = router;

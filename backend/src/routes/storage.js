const express = require('express');
const { uploadMiddleware, uploadHandler, getFileHandler, deleteHandler } = require('../controllers/storageController');
const authMiddleware = require('../middleware/authMiddleware'); // opcional

const router = express.Router();

router.post('/', authMiddleware, uploadMiddleware, uploadHandler);

router.get('/:name', getFileHandler);

router.delete('/:name', authMiddleware, deleteHandler);

module.exports = router;

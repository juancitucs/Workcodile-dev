const express = require('express');
const {
    uploadMiddleware,
    uploadHandler,
    getFileHandler,
    deleteHandler,
} = require('../controllers/storageController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, uploadMiddleware, uploadHandler);
router.get('/:name', authMiddleware, getFileHandler);
router.delete('/:name', authMiddleware, deleteHandler);

module.exports = router;

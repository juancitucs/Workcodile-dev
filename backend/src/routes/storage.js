import express from 'express';
import { uploadMiddleware, uploadHandler, getFileHandler, deleteHandler } from '../controllers/storageController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // opcional

const router = express.Router();

router.post('/', authMiddleware, uploadMiddleware, uploadHandler);

router.get('/:name', getFileHandler);

router.delete('/:name', authMiddleware, deleteHandler);

export default router;

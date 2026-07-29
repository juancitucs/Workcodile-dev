const path = require('path');
const { uploadFile, deleteFile, getFileStream } = require('../services/storage/storage.service');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const uploadMiddleware = upload.single('file');

async function uploadHandler(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided.' });
        }

        const safeName = path.basename(req.file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
        const objectName = `${req.user.id}-${Date.now()}-${safeName}`;
        const url = await uploadFile(objectName, req.file.buffer, req.file.mimetype);

        res.status(201).json({ objectName, url });
    } catch (error) {
        next(error);
    }
}

async function getFileHandler(req, res, next) {
    try {
        const { name } = req.params;
        const safeName = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
        const stream = await getFileStream(safeName);
        res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
        stream.pipe(res);
    } catch (error) {
        next(error);
    }
}

async function deleteHandler(req, res, next) {
    try {
        const { name } = req.params;
        const safeName = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
        if (safeName !== name) {
            return res.status(400).json({ message: 'Invalid file name.' });
        }
        const fileOwnerId = name.split('-')[0];
        if (fileOwnerId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this file.' });
        }
        await deleteFile(name);
        res.json({ message: 'File deleted successfully.' });
    } catch (error) {
        next(error);
    }
}

module.exports = { uploadMiddleware, uploadHandler, getFileHandler, deleteHandler };

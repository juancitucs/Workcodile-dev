const { uploadFile, deleteFile, getFileUrl } = require('../services/storage/storage.service');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

const uploadMiddleware = upload.single('file');

async function uploadHandler(req, res) {
  console.log('Upload handler called');
  console.log('req.file:', req.file);
  try {
    if (!req.file) return res.status(400).json({ message: 'No se envió ningún archivo.' });

    const objectName = `${Date.now()}-${req.file.originalname}`;
    const url = await uploadFile(objectName, req.file.buffer);

    res.status(201).json({ objectName, url });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ message: 'Error al subir el archivo.' });
  }
}

async function getFileHandler(req, res) {
  try {
    const { name } = req.params;
    const url = await getFileUrl(name);
    res.redirect(url);
  } catch (error) {
    console.error('Error al obtener URL:', error);
    res.status(500).json({ message: 'Error al obtener la URL del archivo.' });
  }
}

async function deleteHandler(req, res) {
  try {
    const { name } = req.params;
    await deleteFile(name);
    res.json({ message: 'Archivo eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ message: 'Error al eliminar el archivo.' });
  }
}

module.exports = {
    uploadMiddleware,
    uploadHandler,
    getFileHandler,
    deleteHandler,
};

import { uploadFile, deleteFile, getFileUrl } from '../services/storage/storage.service.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export const uploadMiddleware = upload.single('file');

export async function uploadHandler(req, res) {
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

export async function getFileHandler(req, res) {
  try {
    const { name } = req.params;
    const url = getFileUrl(name);
    res.json({ url });
  } catch (error) {
    console.error('Error al obtener URL:', error);
    res.status(500).json({ message: 'Error al obtener la URL del archivo.' });
  }
}

export async function deleteHandler(req, res) {
  try {
    const { name } = req.params;
    await deleteFile(name);
    res.json({ message: 'Archivo eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ message: 'Error al eliminar el archivo.' });
  }
}

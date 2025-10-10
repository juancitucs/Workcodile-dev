
// backend/src/services/storage/storage.service.js
import minioClient from './storage.provider.js';
import { ensureBucketExists } from './storage.provider.js';

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'workcodile-files';

// Asegurarse de que el bucket exista al iniciar el servicio
ensureBucketExists(BUCKET_NAME);

/**
 * Sube un archivo a MinIO.
 * @param {string} objectName - El nombre del archivo en el bucket (incluyendo carpetas si es necesario).
 * @param {Buffer|string} file - El buffer del archivo o la ruta al archivo.
 * @returns {Promise<string>} - La URL pública del archivo subido.
 */
export async function uploadFile(objectName, file) {
  try {
    await minioClient.putObject(BUCKET_NAME, objectName, file);
    const url = `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${objectName}`;
    console.log(`Archivo subido exitosamente: ${url}`);
    return url;
  } catch (error) {
    console.error("Error al subir el archivo:", error);
    throw new Error('No se pudo subir el archivo.');
  }
}

/**
 * Obtiene la URL de un archivo almacenado en MinIO.
 * @param {string} objectName - El nombre del archivo en el bucket.
 * @returns {string} - La URL pública del archivo.
 */
export function getFileUrl(objectName) {
  return `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${objectName}`;
}

/**
 * Elimina un archivo de MinIO.
 * @param {string} objectName - El nombre del archivo a eliminar.
 * @returns {Promise<void>}
 */
export async function deleteFile(objectName) {
  try {
    await minioClient.removeObject(BUCKET_NAME, objectName);
    console.log(`Archivo eliminado: ${objectName}`);
  } catch (error) {
    console.error("Error al eliminar el archivo:", error);
    throw new Error('No se pudo eliminar el archivo.');
  }
}

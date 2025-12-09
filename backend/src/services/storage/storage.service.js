// backend/src/services/storage/storage.service.js
const { s3, ensureBucketExists, B2_PUBLIC_URL_PREFIX } = require('./storage.provider');

const BUCKET_NAME = process.env.B2_BUCKET_NAME || 'WorkcodileBucket'; // Usar B2_BUCKET_NAME

// Asegurarse de que el bucket exista al iniciar el servicio
ensureBucketExists(BUCKET_NAME);

/**
 * Sube un archivo a Backblaze B2 (compatible con S3).
 * @param {string} objectName - El nombre del archivo en el bucket (incluyendo carpetas si es necesario).
 * @param {Buffer} fileBuffer - El buffer del archivo.
 * @param {string} mimetype - El tipo MIME del archivo.
 * @returns {Promise<string>} - La URL pública del archivo subido.
 */
async function uploadFile(objectName, fileBuffer, mimetype) {
  try {
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: objectName,
      Body: fileBuffer,
      ContentType: mimetype,
      ACL: 'public-read', // Asume que quieres que los archivos sean de lectura pública
    };

    const data = await s3.upload(uploadParams).promise();
    console.log(`Archivo subido exitosamente: ${data.Location}`);
    return data.Location;
  } catch (error) {
    console.error("Error al subir el archivo:", error);
    throw new Error('No se pudo subir el archivo.');
  }
}

/**
 * Obtiene la URL pública de un archivo almacenado en Backblaze B2.
 * @param {string} objectName - El nombre del archivo en el bucket.
 * @returns {string} - La URL pública del archivo.
 */
function getFileUrl(objectName) {
  return `${B2_PUBLIC_URL_PREFIX}/${objectName}`;
}


/**
 * Elimina un archivo de Backblaze B2.
 * @param {string} objectName - El nombre del archivo a eliminar.
 * @returns {Promise<void>}
 */
async function deleteFile(objectName) {
  try {
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: objectName,
    };
    await s3.deleteObject(deleteParams).promise();
    console.log(`Archivo eliminado: ${objectName}`);
  } catch (error) {
    console.error("Error al eliminar el archivo:", error);
    throw new Error('No se pudo eliminar el archivo.');
  }
}

module.exports = {
    uploadFile,
    getFileUrl,
    deleteFile,
};
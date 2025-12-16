// backend/src/services/storage/storage.service.js
const b2Provider = require('./b2.provider');
const cpanelProvider = require('./cpanel.provider');

const { STORAGE_PROVIDER } = process.env;
console.log('STORAGE_PROVIDER:', STORAGE_PROVIDER);

let provider;

switch (STORAGE_PROVIDER) {
  case 'cpanel':
  case 'codetech':
    console.log('Using cPanel as storage provider.');
    provider = cpanelProvider;
    break;
  case 'b2':
  default:
    console.log('Using Backblaze B2 as storage provider.');
    // Ensure the B2 bucket exists on startup
    b2Provider.ensureBucketExists();
    provider = b2Provider;
    break;
}

/**
 * Sube un archivo utilizando el proveedor de almacenamiento configurado.
 * @param {string} objectName - El nombre del archivo en el bucket.
 * @param {Buffer} fileBuffer - El buffer del archivo.
 * @param {string} mimetype - El tipo MIME del archivo.
 * @returns {Promise<string>} - La URL pública del archivo subido.
 */
async function uploadFile(objectName, fileBuffer, mimetype) {
  return provider.uploadFile(objectName, fileBuffer, mimetype);
}

/**
 * Obtiene la URL pública de un archivo utilizando el proveedor de almacenamiento configurado.
 * @param {string} objectName - El nombre del archivo en el bucket.
 * @returns {string} - La URL pública del archivo.
 */
function getFileUrl(objectName) {
  return provider.getFileUrl(objectName);
}

/**
 * Elimina un archivo utilizando el proveedor de almacenamiento configurado.
 * @param {string} objectName - El nombre del archivo a eliminar.
 * @returns {Promise<void>}
 */
async function deleteFile(objectName) {
  return provider.deleteFile(objectName);
}

module.exports = {
  uploadFile,
  getFileUrl,
  deleteFile,
};

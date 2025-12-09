// backend/src/services/storage/storage.provider.js
const AWS = require('aws-sdk');

const BUCKET_NAME_PROVIDER = process.env.B2_BUCKET_NAME || 'WorkcodileBucket';

// Calculate B2_PUBLIC_URL_PREFIX (S3 Compatible)
let B2_PUBLIC_URL_PREFIX;
if (process.env.B2_ENDPOINT_URL && process.env.B2_BUCKET_NAME) {
  const endpoint = process.env.B2_ENDPOINT_URL;
  B2_PUBLIC_URL_PREFIX = `https://${endpoint}/${BUCKET_NAME_PROVIDER}`;
} else {
  // Fallback to a generic local development URL if B2 environment variables are not set
  B2_PUBLIC_URL_PREFIX = `http://${process.env.MINIO_PUBLIC_ENDPOINT || 'localhost'}:9000/${BUCKET_NAME_PROVIDER}`;
}

// Calculate B2_NATIVE_PUBLIC_URL_PREFIX (Backblaze B2 Friendly URL)
// This should be set by the user, e.g., https://f00X.backblazeb2.com/file/YourBucketName
// If not set, we'll fall back to the S3-compatible URL.
const B2_NATIVE_PUBLIC_URL_PREFIX = process.env.B2_NATIVE_PUBLIC_URL_PREFIX || B2_PUBLIC_URL_PREFIX;


// Configuración de AWS SDK para Backblaze B2 compatible con S3
const s3 = new AWS.S3({
  endpoint: process.env.B2_ENDPOINT_URL, // e.g., 'https://s3.us-west-001.backblazeb2.com'
  accessKeyId: process.env.B2_APPLICATION_KEY_ID,
  secretAccessKey: process.env.B2_APPLICATION_KEY,
  s3ForcePathStyle: true, // Necesario para Backblaze B2
  signatureVersion: 'v4', // Necesario para Backblaze B2
  region: 'us-east-1', // Puede ser cualquier valor dummy para B2, o el específico de su bucket si aplica
});

/**
 * Asegura que el bucket principal de la aplicación exista.
 * @param {string} bucketName - Nombre del bucket.
 */
async function ensureBucketExists(bucketName) {
  try {
    // Verificar si el bucket existe
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log(`Bucket '${bucketName}' ya existe.`);
  } catch (error) {
    if (error.code === 'NotFound') {
      // Si el bucket no existe, crearlo
      await s3.createBucket({ Bucket: bucketName }).promise();
      console.log(`Bucket '${bucketName}' creado.`);

      // Configurar política de acceso público para lectura (si se desea)
      // Nota: Las políticas de bucket en B2 se gestionan de forma diferente a AWS S3.
      // Esta es una política básica de S3, que puede necesitar ajustarse para B2.
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] }, // Permite acceso a todos
            Action: ['s3:GetObject'], // Solo lectura
            Resource: [`arn:aws:s3:::${bucketName}/*`], // Para este bucket
          },
        ],
      };
      await s3.putBucketPolicy({ Bucket: bucketName, Policy: JSON.stringify(policy) }).promise();
      console.log(`Política de acceso público configurada para el bucket '${bucketName}'.`);
    } else {
      console.error("Error al inicializar el bucket:", error);
      throw error; // Re-lanzar otros errores
    }
  }
}

module.exports = {
    s3,
    ensureBucketExists,
    B2_PUBLIC_URL_PREFIX,
    BUCKET_NAME_PROVIDER,
    B2_NATIVE_PUBLIC_URL_PREFIX,
};
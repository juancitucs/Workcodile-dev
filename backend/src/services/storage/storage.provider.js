
// backend/src/services/storage/storage.provider.js
const { Client } = require('minio');

// Este cliente se conecta al servicio de MinIO definido en docker-compose.yml
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT, 10) || 9000,
  useSSL: false, // En desarrollo no usamos SSL
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

/**
 * Asegura que el bucket principal de la aplicación exista.
 * @param {string} bucketName - Nombre del bucket.
 */
async function ensureBucketExists(bucketName) {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName);
      console.log(`Bucket '${bucketName}' creado.`);
      // Opcional: Configurar política de acceso público para lectura
      const policy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      });
      await minioClient.setBucketPolicy(bucketName, policy);
      console.log(`Política de acceso público configurada para el bucket '${bucketName}'.`);
    }
  } catch (error) {
    console.error("Error al inicializar el bucket de MinIO:", error);
  }
}

module.exports = {
    minioClient,
    ensureBucketExists,
};

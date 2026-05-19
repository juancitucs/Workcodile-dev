const AWS = require('aws-sdk');

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = process.env.MINIO_PORT || '9000';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin123';
const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'workcodile-files';
const MINIO_PUBLIC_ENDPOINT = process.env.MINIO_PUBLIC_ENDPOINT || 'http://localhost:9000';

const s3 = new AWS.S3({
  endpoint: `http://${MINIO_ENDPOINT}:${MINIO_PORT}`,
  accessKeyId: MINIO_ACCESS_KEY,
  secretAccessKey: MINIO_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: 'us-east-1',
});

async function ensureBucketExists() {
  try {
    await s3.headBucket({ Bucket: MINIO_BUCKET_NAME }).promise();
    console.log(`MinIO bucket '${MINIO_BUCKET_NAME}' already exists.`);
  } catch (error) {
    if (error.statusCode === 404) {
      console.log(`MinIO bucket '${MINIO_BUCKET_NAME}' does not exist. Creating...`);
      await s3.createBucket({ Bucket: MINIO_BUCKET_NAME }).promise();
      console.log(`MinIO bucket '${MINIO_BUCKET_NAME}' created.`);
    } else {
      console.error('Error checking for MinIO bucket:', error);
      throw error;
    }
  }
}

async function uploadFile(objectName, fileBuffer, mimetype) {
  const uploadParams = {
    Bucket: MINIO_BUCKET_NAME,
    Key: objectName,
    Body: fileBuffer,
    ContentType: mimetype,
  };
  await s3.upload(uploadParams).promise();
  return getFileUrl(objectName);
}

function getFileUrl(objectName) {
  const base = MINIO_PUBLIC_ENDPOINT.replace(/\/$/, '');
  return `${base}/${MINIO_BUCKET_NAME}/${objectName}`;
}

async function deleteFile(objectName) {
  await s3.deleteObject({ Bucket: MINIO_BUCKET_NAME, Key: objectName }).promise();
}

async function getFileStream(objectName) {
  return s3.getObject({ Bucket: MINIO_BUCKET_NAME, Key: objectName }).createReadStream();
}

module.exports = {
  ensureBucketExists,
  uploadFile,
  getFileUrl,
  deleteFile,
  getFileStream,
};

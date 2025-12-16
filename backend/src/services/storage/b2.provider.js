// backend/src/services/storage/b2.provider.js
const AWS = require('aws-sdk');

const BUCKET_NAME_PROVIDER = process.env.B2_BUCKET_NAME || 'WorkcodileBucket';

// Calculate B2_PUBLIC_URL_PREFIX (S3 Compatible)
let B2_PUBLIC_URL_PREFIX;
if (process.env.B2_ENDPOINT_URL && process.env.B2_BUCKET_NAME) {
  const endpoint = process.env.B2_ENDPOINT_URL.replace('https://', '');
  B2_PUBLIC_URL_PREFIX = `https://${BUCKET_NAME_PROVIDER}.${endpoint}`;
} else {
  // Fallback to a generic local development URL if B2 environment variables are not set
  B2_PUBLIC_URL_PREFIX = `http://${process.env.MINIO_PUBLIC_ENDPOINT || 'localhost'}:9000/${BUCKET_NAME_PROVIDER}`;
}

const B2_NATIVE_PUBLIC_URL_PREFIX = process.env.B2_NATIVE_PUBLIC_URL_PREFIX;

const s3 = new AWS.S3({
  endpoint: process.env.B2_ENDPOINT_URL,
  accessKeyId: process.env.B2_APPLICATION_KEY_ID,
  secretAccessKey: process.env.B2_APPLICATION_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: 'us-east-1',
});

async function ensureBucketExists() {
  try {
    await s3.headBucket({ Bucket: BUCKET_NAME_PROVIDER }).promise();
    console.log(`Bucket '${BUCKET_NAME_PROVIDER}' already exists.`);
  } catch (error) {
    if (error.statusCode === 404) {
      console.log(`Bucket '${BUCKET_NAME_PROVIDER}' does not exist. Creating...`);
      await s3.createBucket({ Bucket: BUCKET_NAME_PROVIDER }).promise();
      console.log(`Bucket '${BUCKET_NAME_PROVIDER}' created.`);
    } else {
      console.error("Error checking for bucket:", error);
      throw error;
    }
  }
}

async function uploadFile(objectName, fileBuffer, mimetype) {
  try {
    const uploadParams = {
      Bucket: BUCKET_NAME_PROVIDER,
      Key: objectName,
      Body: fileBuffer,
      ContentType: mimetype,
    };

    const data = await s3.upload(uploadParams).promise();
    console.log(`File uploaded successfully: ${data.Location}`);
    // Return the friendly URL if available, otherwise the S3 compatible one
    return getFileUrl(objectName);
  } catch (error) {
    console.error("Error uploading file to B2:", error);
    throw new Error('Could not upload file to B2.');
  }
}

function getFileUrl(objectName) {
  const baseUrl = B2_NATIVE_PUBLIC_URL_PREFIX || B2_PUBLIC_URL_PREFIX;
  return `${baseUrl}/${objectName}`;
}

async function deleteFile(objectName) {
  try {
    const deleteParams = {
      Bucket: BUCKET_NAME_PROVIDER,
      Key: objectName,
    };
    await s3.deleteObject(deleteParams).promise();
    console.log(`File deleted from B2: ${objectName}`);
  } catch (error) {
    console.error("Error deleting file from B2:", error);
    throw new Error('Could not delete file from B2.');
  }
}

module.exports = {
  ensureBucketExists,
  uploadFile,
  getFileUrl,
  deleteFile,
};

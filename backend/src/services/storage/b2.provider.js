const AWS = require('aws-sdk')
const config = require('../../config/env')

const {
  endpointUrl: B2_ENDPOINT_URL,
  applicationKeyId: B2_APPLICATION_KEY_ID,
  applicationKey: B2_APPLICATION_KEY,
  bucketName: B2_BUCKET_NAME,
  nativePublicUrlPrefix: B2_NATIVE_PUBLIC_URL_PREFIX,
} = config.storage.b2

let B2_PUBLIC_URL_PREFIX
if (B2_ENDPOINT_URL && B2_BUCKET_NAME) {
  const endpoint = B2_ENDPOINT_URL.replace('https://', '')
  B2_PUBLIC_URL_PREFIX = `https://${B2_BUCKET_NAME}.${endpoint}`
} else {
  B2_PUBLIC_URL_PREFIX = `http://localhost:9000/${B2_BUCKET_NAME}`
}

const s3 = new AWS.S3({
  endpoint: B2_ENDPOINT_URL,
  accessKeyId: B2_APPLICATION_KEY_ID,
  secretAccessKey: B2_APPLICATION_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: 'us-east-1',
})

async function ensureBucketExists() {
  try {
    await s3.headBucket({ Bucket: B2_BUCKET_NAME }).promise()
    console.log(`Bucket '${B2_BUCKET_NAME}' already exists.`)
  } catch (error) {
    if (error.statusCode === 404) {
      console.log(`Bucket '${B2_BUCKET_NAME}' does not exist. Creating...`)
      await s3.createBucket({ Bucket: B2_BUCKET_NAME }).promise()
      console.log(`Bucket '${B2_BUCKET_NAME}' created.`)
    } else {
      console.error('Error checking for bucket:', error)
      throw error
    }
  }
}

async function uploadFile(objectName, fileBuffer, mimetype) {
  await s3.upload({
    Bucket: B2_BUCKET_NAME,
    Key: objectName,
    Body: fileBuffer,
    ContentType: mimetype,
  }).promise()
  return getFileUrl(objectName)
}

function getFileUrl(objectName) {
  const baseUrl = B2_NATIVE_PUBLIC_URL_PREFIX || B2_PUBLIC_URL_PREFIX
  return `${baseUrl}/${objectName}`
}

async function deleteFile(objectName) {
  await s3.deleteObject({ Bucket: B2_BUCKET_NAME, Key: objectName }).promise()
}

module.exports = {
  ensureBucketExists,
  uploadFile,
  getFileUrl,
  deleteFile,
}
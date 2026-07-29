const AWS = require('aws-sdk');
const config = require('../../config/env');

const {
    endpoint: MINIO_ENDPOINT,
    port: MINIO_PORT,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
    bucket: MINIO_BUCKET_NAME,
    publicEndpoint: MINIO_PUBLIC_ENDPOINT,
} = config.storage.minio;

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

    try {
        const policy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Sid: 'PublicReadGetObject',
                    Effect: 'Allow',
                    Principal: '*',
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${MINIO_BUCKET_NAME}/*`],
                },
            ],
        };
        await s3.putBucketPolicy({
            Bucket: MINIO_BUCKET_NAME,
            Policy: JSON.stringify(policy),
        }).promise();
    } catch (policyErr) {
        console.warn('Could not set public bucket policy on MinIO:', policyErr.message);
    }
}

async function uploadFile(objectName, fileBuffer, mimetype) {
    await s3
        .upload({
            Bucket: MINIO_BUCKET_NAME,
            Key: objectName,
            Body: fileBuffer,
            ContentType: mimetype,
        })
        .promise();
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

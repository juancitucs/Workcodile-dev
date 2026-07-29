const path = require('path');
const envFile = process.env.NODE_ENV === 'test' ? '../../.env.test' : '../../.env';
require('dotenv').config({ path: path.resolve(__dirname, envFile) });

const env = (key, fallback) => {
    if (process.env[key] === undefined && fallback === undefined) {
        throw new Error(`Missing required env var: ${key}`);
    }
    return process.env[key] ?? fallback;
};

const config = {
    port: parseInt(env('PORT', '3001'), 10),
    nodeEnv: env('NODE_ENV', 'development'),
    isDev: env('NODE_ENV', 'development') !== 'production',
    isTest: env('NODE_ENV', '') === 'test',

    mongo: {
        uri: env('MONGO_URI'),
    },

    jwt: {
        secret: env('JWT_SECRET'),
        expiresIn: parseInt(env('JWT_EXPIRES_IN', '360000'), 10),
    },

    storage: {
        provider: env('STORAGE_PROVIDER', 'minio'),
        minio: {
            endpoint: env('MINIO_ENDPOINT', 'localhost'),
            port: env('MINIO_PORT', '9000'),
            accessKey: env('MINIO_ACCESS_KEY', 'minioadmin'),
            secretKey: env('MINIO_SECRET_KEY', 'minioadmin123'),
            bucket: env('MINIO_BUCKET_NAME', 'workcodile-files'),
            publicEndpoint: env('MINIO_PUBLIC_ENDPOINT', 'http://localhost:9000'),
        },
        b2: {
            endpointUrl: env('B2_ENDPOINT_URL', ''),
            applicationKeyId: env('B2_APPLICATION_KEY_ID', ''),
            applicationKey: env('B2_APPLICATION_KEY', ''),
            bucketName: env('B2_BUCKET_NAME', 'WorkcodileBucket'),
            nativePublicUrlPrefix: env('B2_NATIVE_PUBLIC_URL_PREFIX', ''),
        },
        cpanel: {
            server: env('CPANEL_SERVER', ''),
            user: env('CPANEL_USER', ''),
            apiToken: env('CPANEL_API_TOKEN', ''),
            publicUrl: env('CPANEL_PUBLIC_URL', ''),
            uploadDir: env('CPANEL_UPLOAD_DIR', ''),
        },
    },

    frontendUrl: env('FRONTEND_URL', 'http://localhost:5173'),

    email: {
        resendApiKey: env('RESEND_API_KEY', ''),
        fromAddress: env('EMAIL_FROM', '"WorkCodile" <noreply@codetechilo.com>'),
    },
};

module.exports = config;

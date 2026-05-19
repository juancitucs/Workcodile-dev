const { STORAGE_PROVIDER } = process.env;
console.log('STORAGE_PROVIDER:', STORAGE_PROVIDER);

function getProvider() {
  switch (STORAGE_PROVIDER) {
    case 'minio': {
      const { ensureBucketExists } = require('./minio.provider');
      ensureBucketExists().catch(err =>
        console.warn('MinIO bucket check failed:', err.message)
      );
      return require('./minio.provider');
    }
    case 'cpanel':
    case 'codetech': {
      return require('./cpanel.provider');
    }
    case 'b2': {
      const { ensureBucketExists } = require('./b2.provider');
      ensureBucketExists().catch(err =>
        console.warn('B2 bucket check failed:', err.message)
      );
      return require('./b2.provider');
    }
    default: {
      console.log('No valid STORAGE_PROVIDER set. Defaulting to MinIO.');
      const { ensureBucketExists } = require('./minio.provider');
      ensureBucketExists().catch(err =>
        console.warn('MinIO bucket check failed:', err.message)
      );
      return require('./minio.provider');
    }
  }
}

const provider = getProvider();

async function uploadFile(objectName, fileBuffer, mimetype) {
  return provider.uploadFile(objectName, fileBuffer, mimetype);
}

function getFileUrl(objectName) {
  return provider.getFileUrl(objectName);
}

async function deleteFile(objectName) {
  return provider.deleteFile(objectName);
}

async function getFileStream(objectName) {
  if (provider.getFileStream) {
    return provider.getFileStream(objectName);
  }
  throw new Error('Streaming not supported by current provider');
}

module.exports = {
  uploadFile,
  getFileUrl,
  deleteFile,
  getFileStream,
};

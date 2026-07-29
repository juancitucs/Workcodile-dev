const axios = require('axios');
const FormData = require('form-data');
const config = require('../../config/env');

const {
    server: CPANEL_SERVER,
    user: CPANEL_USER,
    apiToken: CPANEL_API_TOKEN,
    publicUrl: CPANEL_PUBLIC_URL,
    uploadDir: CPANEL_UPLOAD_DIR,
} = config.storage.cpanel;

if (
    !CPANEL_SERVER ||
    !CPANEL_USER ||
    !CPANEL_API_TOKEN ||
    !CPANEL_PUBLIC_URL ||
    !CPANEL_UPLOAD_DIR
) {
    throw new Error(
        'cPanel storage provider is missing one or more required environment variables: CPANEL_SERVER, CPANEL_USER, CPANEL_API_TOKEN, CPANEL_PUBLIC_URL, CPANEL_UPLOAD_DIR',
    );
}

async function uploadFile(objectName, fileBuffer, mimetype) {
    const form = new FormData();
    form.append('dir', CPANEL_UPLOAD_DIR);
    form.append('overwrite', 1);
    form.append('file-1', fileBuffer, {
        filename: objectName,
        contentType: mimetype,
    });

    try {
        const response = await axios.post(`${CPANEL_SERVER}/execute/Fileman/upload_files`, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `cpanel ${CPANEL_USER}:${CPANEL_API_TOKEN}`,
            },
        });

        if (response.data.errors) {
            throw new Error(`cPanel API Error: ${response.data.errors.join(', ')}`);
        }

        return getFileUrl(objectName);
    } catch (error) {
        console.error('Error uploading to cPanel:', error.message);
        throw new Error('Failed to upload file to cPanel.');
    }
}

function getFileUrl(objectName) {
    return `${CPANEL_PUBLIC_URL.replace(/\/$/, '')}/${objectName}`;
}

async function deleteFile(objectName) {
    console.log(`[cPanel Provider] Deletion for '${objectName}' is not implemented.`);
}

module.exports = {
    uploadFile,
    getFileUrl,
    deleteFile,
};

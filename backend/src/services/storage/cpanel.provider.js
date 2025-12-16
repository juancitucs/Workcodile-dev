const axios = require('axios');
const FormData = require('form-data');

const {
  CPANEL_SERVER,
  CPANEL_USER,
  CPANEL_API_TOKEN,
  CPANEL_PUBLIC_URL,
  CPANEL_UPLOAD_DIR,
} = process.env;

// Startup check for required environment variables
if (!CPANEL_SERVER || !CPANEL_USER || !CPANEL_API_TOKEN || !CPANEL_PUBLIC_URL || !CPANEL_UPLOAD_DIR) {
  throw new Error(
    'cPanel storage provider is missing one or more required environment variables: CPANEL_SERVER, CPANEL_USER, CPANEL_API_TOKEN, CPANEL_PUBLIC_URL, CPANEL_UPLOAD_DIR'
  );
}

/**
 * Uploads a file to cPanel using the Fileman API.
 * @param {string} objectName - The name of the file to save.
 * @param {Buffer} fileBuffer - The file content as a buffer.
 * @param {string} mimetype - The mimetype of the file.
 * @returns {Promise<string>} - The public URL of the uploaded file.
 */
async function uploadFile(objectName, fileBuffer, mimetype) {
  const form = new FormData();
  form.append('dir', CPANEL_UPLOAD_DIR);
  form.append('overwrite', 1);
  form.append('file-1', fileBuffer, {
    filename: objectName,
    contentType: mimetype,
  });

  try {
    const response = await axios.post(
      `${CPANEL_SERVER}/execute/Fileman/upload_files`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `cpanel ${CPANEL_USER}:${CPANEL_API_TOKEN}`,
        },
      }
    );

    if (response.data.errors) {
      throw new Error(`cPanel API Error: ${response.data.errors.join(', ')}`);
    }

    console.log('File uploaded successfully to cPanel:', response.data);
    return getFileUrl(objectName);
  } catch (error) {
    console.error('Error uploading to cPanel:', error.message);
    throw new Error('Failed to upload file to cPanel.');
  }
}

/**
 * Gets the public URL of a file stored in cPanel.
 * @param {string} objectName - The name of the file.
 * @returns {string} - The public URL of the file.
 */
function getFileUrl(objectName) {
  // Ensure no double slashes
  return `${CPANEL_PUBLIC_URL.replace(/\/$/, '')}/${objectName}`;
}

/**
 * Deletes a file from cPanel.
 * NOTE: The standard cPanel UAPI does not have a direct file deletion endpoint equivalent
 * to `rm`. This would typically require using the `Fileman/file_op` function with specific
arrauments,
 * which is more complex. For this implementation, we will leave it as a no-op.
 * @param {string} objectName - The name of the file to delete.
 * @returns {Promise<void>}
 */
async function deleteFile(objectName) {
  console.log(`[cPanel Provider] Deletion for '${objectName}' is not implemented.`);
  // To implement this, you would need to make a request like:
  // /execute/Fileman/file_op?op=trash&sourcefiles=/path/to/file
  // This is a placeholder.
  return Promise.resolve();
}

module.exports = {
  uploadFile,
  getFileUrl,
  deleteFile,
};
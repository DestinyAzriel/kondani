// Centralized media storage.
// If Cloudinary env vars are present, uploads go to Cloudinary (persistent,
// survives Render redeploys) and we store the returned https secure_url.
// If not configured, we fall back to local disk (/uploads/...) so the app
// still works in local dev — note that on Render's free tier the local disk
// is wiped on every redeploy, which is exactly why Cloudinary exists.

const fs = require('fs');
const path = require('path');

let cloudinary = null;
const configured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (configured) {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('[media] Cloudinary configured — uploads will persist.');
} else {
  console.warn('[media] Cloudinary NOT configured — falling back to local disk (ephemeral on Render).');
}

function isConfigured() {
  return configured;
}

function uploadBuffer(buffer, { folder, resourceType = 'auto' }) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

/**
 * Store a multer (memoryStorage) file and return a URL string.
 * @param {object} file - multer file: { buffer, originalname, mimetype, fieldname }
 * @param {string} subfolder - e.g. 'photos', 'chat-media', 'selfies'
 * @param {string} resourceType - 'image' | 'video' | 'auto' (audio uses 'video')
 * @returns {Promise<string>} cloud secure_url, or a local /uploads path
 */
async function storeUpload(file, subfolder = 'misc', resourceType = 'auto') {
  if (!file || !file.buffer) throw new Error('No file buffer to store');

  if (configured) {
    const result = await uploadBuffer(file.buffer, {
      folder: `kondani/${subfolder}`,
      resourceType,
    });
    return result.secure_url;
  }

  // Local-disk fallback
  const dir = path.join('uploads', subfolder);
  fs.mkdirSync(dir, { recursive: true });
  const ext = path.extname(file.originalname || '') || '';
  const name = `${file.fieldname || 'file'}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  fs.writeFileSync(path.join(dir, name), file.buffer);
  return `/uploads/${subfolder}/${name}`;
}

module.exports = { isConfigured, storeUpload, cloudinary };

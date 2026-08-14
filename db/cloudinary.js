const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Uploads an in-memory file buffer (from multer's memoryStorage) to Cloudinary.
// Returns a promise that resolves to { url, publicId }.
function uploadBuffer(buffer, folder = 'navin-iron-industries') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

function deleteImage(publicId) {
  if (!publicId) return Promise.resolve();
  return cloudinary.uploader.destroy(publicId).catch(() => {});
}

module.exports = { uploadBuffer, deleteImage };

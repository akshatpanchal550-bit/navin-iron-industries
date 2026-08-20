const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { db } = require('../db/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /image\/(jpeg|png|webp|gif)/.test(file.mimetype);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  }
});

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return reject(new Error('Cloudinary environment variables are missing on the server.'));
    }
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'navin-iron-industries' },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}

router.get('/', (req, res) => {
  res.json(db.listProducts());
});

router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  const { title, category, description } = req.body;
  if (!title || !req.file) {
    return res.status(400).json({ error: 'Title and image are required' });
  }
  try {
    const result = await uploadToCloudinary(req.file.buffer);
    const product = db.createProduct({ title, category, description, image_path: result.secure_url });
    res.json(product);
  } catch (err) {
    console.error('[products] Cloudinary upload failed:', err.message);
    res.status(500).json({ error: 'Photo upload failed: ' + err.message });
  }
});

router.put('/:id', requireAdmin, upload.single('image'), async (req, res) => {
  const { title, category, description } = req.body;
  const existing = db.getProduct(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  let imagePath = existing.image_path;
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer);
      imagePath = result.secure_url;
    } catch (err) {
      console.error('[products] Cloudinary upload failed:', err.message);
      return res.status(500).json({ error: 'Photo upload failed: ' + err.message });
    }
  }

  db.updateProduct(req.params.id, {
    title: title || existing.title,
    category: category || existing.category,
    description: description || existing.description,
    image_path: imagePath
  });
  res.json({ ok: true });
});

router.delete('/:id', requireAdmin, (req, res) => {
  const existing = db.getProduct(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  db.deleteProduct(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

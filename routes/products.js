const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, safeName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    const ok = /image\/(jpeg|png|webp|gif)/.test(file.mimetype);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  }
});

// Public: list all products (used by services.html to render the catalog)
router.get('/', (req, res) => {
  res.json(db.listProducts());
});

// Admin: create a product with an uploaded photo
router.post('/', requireAdmin, upload.single('image'), (req, res) => {
  const { title, category, description } = req.body;
  if (!title || !req.file) {
    return res.status(400).json({ error: 'Title and image are required' });
  }
  const imagePath = '/uploads/' + req.file.filename;
  const product = db.createProduct({ title, category, description, image_path: imagePath });
  res.json(product);
});

// Admin: update a product's text fields (and optionally replace its photo)
router.put('/:id', requireAdmin, upload.single('image'), (req, res) => {
  const { title, category, description } = req.body;
  const existing = db.getProduct(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  let imagePath = existing.image_path;
  if (req.file) {
    imagePath = '/uploads/' + req.file.filename;
    const oldFile = path.join(uploadDir, path.basename(existing.image_path));
    if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
  }

  db.updateProduct(req.params.id, {
    title: title || existing.title,
    category: category || existing.category,
    description: description || existing.description,
    image_path: imagePath
  });
  res.json({ ok: true });
});

// Admin: delete a product
router.delete('/:id', requireAdmin, (req, res) => {
  const existing = db.getProduct(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  const file = path.join(uploadDir, path.basename(existing.image_path));
  if (fs.existsSync(file)) fs.unlinkSync(file);
  db.deleteProduct(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

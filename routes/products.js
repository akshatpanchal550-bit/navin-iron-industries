const express = require('express');
const multer = require('multer');
const { db } = require('../db/db');
const { requireAdmin } = require('../middleware/auth');
const { uploadBuffer, deleteImage } = require('../db/cloudinary');

const router = express.Router();

// Store the uploaded file in memory (not on disk) so we can forward it
// straight to Cloudinary. Render's local disk is wiped on every restart,
// so anything saved to disk here would disappear.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    const ok = /image\/(jpeg|png|webp|gif)/.test(file.mimetype);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  }
});

// Public: list all products (used by services.html to render the catalog)
router.get('/', async (req, res) => {
  res.json(await db.listProducts());
});

// Admin: create a product with an uploaded photo
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  const { title, category, description } = req.body;
  if (!title || !req.file) {
    return res.status(400).json({ error: 'Title and image are required' });
  }
  try {
    const { url, publicId } = await uploadBuffer(req.file.buffer);
    const product = await db.createProduct({
      title,
      category,
      description,
      image_path: url,
      image_public_id: publicId
    });
    res.json(product);
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// Admin: update a product's text fields (and optionally replace its photo)
router.put('/:id', requireAdmin, upload.single('image'), async (req, res) => {
  const { title, category, description } = req.body;
  const existing = await db.getProduct(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  let imagePath = existing.image_path;
  let imagePublicId = existing.image_public_id;

  if (req.file) {
    try {
      const { url, publicId } = await uploadBuffer(req.file.buffer);
      imagePath = url;
      imagePublicId = publicId;
      await deleteImage(existing.image_public_id); // clean up the old photo
    } catch (err) {
      console.error('Cloudinary upload failed:', err);
      return res.status(500).json({ error: 'Image upload failed' });
    }
  }

  await db.updateProduct(req.params.id, {
    title: title || existing.title,
    category: category || existing.category,
    description: description || existing.description,
    image_path: imagePath,
    image_public_id: imagePublicId
  });
  res.json({ ok: true });
});

// Admin: delete a product
router.delete('/:id', requireAdmin, async (req, res) => {
  const existing = await db.getProduct(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  await deleteImage(existing.image_public_id);
  await db.deleteProduct(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

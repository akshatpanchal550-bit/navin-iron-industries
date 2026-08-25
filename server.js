require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const { ensureSeedAdmin } = require('./db/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const visitRoutes = require('./routes/visits');
const contactRoutes = require('./routes/contact');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/contact', contactRoutes);

app.get('/api/debug-db', async (req, res) => {
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('navin_iron_industries');
    const cols = await db.listCollections().toArray();
    const productsCount = await db.collection('products').countDocuments();
    res.json({
      dbName: db.databaseName,
      collections: cols.map(c => c.name),
      productsCount,
      cloudinaryConfigured: !!process.env.CLOUDINARY_CLOUD_NAME
    });
    await client.close();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await ensureSeedAdmin();
    app.listen(PORT, () => {
      console.log(`Navin Iron Industries site running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

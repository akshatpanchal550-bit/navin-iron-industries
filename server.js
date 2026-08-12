require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const { ensureSeedAdmin } = require('./db/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const visitRoutes = require('./routes/visits');
const contactRoutes = require('./routes/contact');

ensureSeedAdmin();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/contact', contactRoutes);

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Navin Iron Industries site running at http://localhost:${PORT}`);
});

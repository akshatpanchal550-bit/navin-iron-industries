const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

let client;
let dbInstance;

async function connect() {
  if (dbInstance) return dbInstance;
  client = new MongoClient(process.env.MONGODB_URI, {
    writeConcern: { w: 'majority' },
    retryWrites: true
  });
  await client.connect();
  dbInstance = client.db('navin_iron_industries');
  return dbInstance;
}

async function ensureSeedAdmin() {
  const database = await connect();
  const admins = database.collection('admins');
  const count = await admins.countDocuments();
  if (count === 0) {
    const email = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'changeme';
    const hash = bcrypt.hashSync(password, 10);
    await admins.insertOne({ email, password_hash: hash, created_at: new Date().toISOString() });
    console.log(`[setup] Created first admin account: ${email}`);
    console.log('[setup] Log in at /admin/login.html with the ADMIN_EMAIL / ADMIN_PASSWORD from your .env file.');
  }
}

const db = {
  async findAdminByEmail(email) {
    const database = await connect();
    return database.collection('admins').findOne({ email: (email || '').trim().toLowerCase() });
  },

  async listProducts() {
    const database = await connect();
    const docs = await database.collection('products').find().sort({ created_at: -1 }).toArray();
    return docs.map(d => ({ ...d, id: d._id.toString() }));
  },

  async getProduct(id) {
    const database = await connect();
    if (!ObjectId.isValid(id)) return null;
    const d = await database.collection('products').findOne({ _id: new ObjectId(id) });
    return d ? { ...d, id: d._id.toString() } : null;
  },

  async createProduct({ title, category, description, image_path }) {
    const database = await connect();
    const doc = {
      title,
      category: category || '',
      description: description || '',
      image_path,
      created_at: new Date().toISOString()
    };
    const result = await database.collection('products').insertOne(doc);
    return { ...doc, id: result.insertedId.toString() };
  },

  async updateProduct(id, fields) {
    const database = await connect();
    if (!ObjectId.isValid(id)) return null;
    await database.collection('products').updateOne({ _id: new ObjectId(id) }, { $set: fields });
    return db.getProduct(id);
  },

  async deleteProduct(id) {
    const database = await connect();
    if (!ObjectId.isValid(id)) return false;
    const result = await database.collection('products').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },

  async findRecentVisit(visitorId, cooldownMinutes) {
    const database = await connect();
    const cutoff = new Date(Date.now() - cooldownMinutes * 60000).toISOString();
    return database.collection('visits').findOne(
      { visitor_id: visitorId, created_at: { $gte: cutoff } },
      { sort: { created_at: -1 } }
    );
  },

  async addVisit({ visitor_id, page, ip }) {
    const database = await connect();
    const doc = { visitor_id, page, ip: ip || '', created_at: new Date().toISOString() };
    await database.collection('visits').insertOne(doc);
    return doc;
  }
};

module.exports = { db, ensureSeedAdmin };

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { admins: [], products: [], visits: [], nextIds: { admin: 1, product: 1, visit: 1 } };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

let data = loadData();

function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function ensureSeedAdmin() {
  if (data.admins.length === 0) {
    const email = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'changeme';
    const hash = bcrypt.hashSync(password, 10);
    data.admins.push({ id: data.nextIds.admin++, email, password_hash: hash, created_at: new Date().toISOString() });
    save();
    console.log(`[setup] Created first admin account: ${email}`);
    console.log('[setup] Log in at /admin/login.html with the ADMIN_EMAIL / ADMIN_PASSWORD from your .env file.');
  }
}

const db = {
  findAdminByEmail(email) {
    return data.admins.find(a => a.email === (email || '').trim().toLowerCase());
  },

  listProducts() {
    return [...data.products].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },

  getProduct(id) {
    return data.products.find(p => p.id === Number(id));
  },

  createProduct({ title, category, description, image_path }) {
    const p = {
      id: data.nextIds.product++,
      title,
      category: category || '',
      description: description || '',
      image_path,
      created_at: new Date().toISOString()
    };
    data.products.push(p);
    save();
    return p;
  },

  updateProduct(id, fields) {
    const p = db.getProduct(id);
    if (!p) return null;
    Object.assign(p, fields);
    save();
    return p;
  },

  deleteProduct(id) {
    const idx = data.products.findIndex(p => p.id === Number(id));
    if (idx === -1) return false;
    data.products.splice(idx, 1);
    save();
    return true;
  },

  findRecentVisit(visitorId, cooldownMinutes) {
    const cutoff = Date.now() - cooldownMinutes * 60000;
    return [...data.visits].reverse().find(
      v => v.visitor_id === visitorId && new Date(v.created_at).getTime() >= cutoff
    );
  },

  addVisit({ visitor_id, page, ip }) {
    const v = { id: data.nextIds.visit++, visitor_id, page, ip: ip || '', created_at: new Date().toISOString() };
    data.visits.push(v);
    save();
    return v;
  }
};

module.exports = { db, ensureSeedAdmin };

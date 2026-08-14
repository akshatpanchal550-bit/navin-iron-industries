const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function ensureSeedAdmin() {
  const { data: existing, error } = await supabase.from('admins').select('id').limit(1);
  if (error) {
    console.error('[setup] Could not reach Supabase:', error.message);
    return;
  }
  if (!existing || existing.length === 0) {
    const email = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'changeme';
    const hash = bcrypt.hashSync(password, 10);
    await supabase.from('admins').insert({ email, password_hash: hash });
    console.log(`[setup] Created first admin account: ${email}`);
    console.log('[setup] Log in at /admin/login.html with the ADMIN_EMAIL / ADMIN_PASSWORD from your .env file.');
  }
}

const db = {
  async findAdminByEmail(email) {
    const { data } = await supabase
      .from('admins')
      .select('*')
      .eq('email', (email || '').trim().toLowerCase())
      .maybeSingle();
    return data;
  },

  async listProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  },

  async getProduct(id) {
    const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    return data;
  },

  async createProduct({ title, category, description, image_path, image_public_id }) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        title,
        category: category || '',
        description: description || '',
        image_path,
        image_public_id: image_public_id || null
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateProduct(id, fields) {
    const { data, error } = await supabase
      .from('products')
      .update(fields)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async deleteProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    return !error;
  },

  async findRecentVisit(visitorId, cooldownMinutes) {
    const cutoff = new Date(Date.now() - cooldownMinutes * 60000).toISOString();
    const { data } = await supabase
      .from('visits')
      .select('*')
      .eq('visitor_id', visitorId)
      .gte('created_at', cutoff)
      .limit(1)
      .maybeSingle();
    return data;
  },

  async addVisit({ visitor_id, page, ip }) {
    const { data } = await supabase
      .from('visits')
      .insert({ visitor_id, page: page || '/', ip: ip || '' })
      .select()
      .single();
    return data;
  }
};

module.exports = { db, ensureSeedAdmin };

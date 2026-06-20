#!/usr/bin/env node
/*
Script to populate missing product images/description/tags and create default variants
Run with: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/populate_product_variants.js
*/
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) { console.error('failed to fetch products', error); process.exit(1); }

  for (const p of products) {
    const updates = {};
    if (!p.description || p.description.trim() === '') updates.description = `Delicious ${p.name} from Jaba Waba.`;
    if (!p.images || p.images.length === 0) updates.images = [p.image || 'https://images.unsplash.com/photo-1508747703725-7197e5119a04?auto=format&fit=crop&q=80&w=900'];
    if (!p.tags || p.tags.length === 0) updates.tags = ['JabaWaba', p.category];

    if (Object.keys(updates).length > 0) {
      const { error: upErr } = await supabase.from('products').update(updates).eq('id', p.id);
      if (upErr) console.error('failed to update product', p.id, upErr);
      else console.log('updated product', p.id);
    }

    // create default variants for juice and merch
    const lowerCat = (p.category || '').toLowerCase();
    let defaultVariants = [];
    if (lowerCat === 'juice') defaultVariants = ['500ml', '1L', '2L'];
    else if (lowerCat === 'merch') defaultVariants = ['S', 'M', 'L', 'XL'];
    else defaultVariants = []; // leave other categories

    for (const name of defaultVariants) {
      // check exists
      const { data: exists } = await supabase.from('product_variants').select('*').eq('product_id', p.id).eq('name', name).limit(1);
      if (exists && exists.length > 0) continue;
      const { data: created, error: cErr } = await supabase.from('product_variants').insert({ product_id: p.id, name }).select().single();
      if (cErr) { console.error('failed create variant', p.id, name, cErr); continue; }
      console.log('created variant', created.id, 'for product', p.id);
    }
  }

  console.log('done');
}

main().catch((err) => { console.error(err); process.exit(1); });

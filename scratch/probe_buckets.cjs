const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function probe() {
  const names = ['photos', 'images', 'customers', 'crm', 'car-photos'];
  for (const name of names) {
    const { data, error } = await supabase.storage.getBucket(name);
    if (!error) {
       console.log(`✅ 找到 Bucket: ${name}`);
    } else {
       console.log(`❌ 未找到 Bucket: ${name} (${error.message})`);
    }
  }
}

probe();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function probe() {
  const { data, error } = await supabase.from('inventory').insert({ id: 'PROBE-' + Date.now() }).select();
  if (error) {
    console.error('Error with ID only:', error);
  } else {
    console.log('Success with ID! Columns:', Object.keys(data[0]));
  }
}

probe();

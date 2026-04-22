import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://emqtgyntrpounnmssxcf.supabase.co', 
  'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo'
);

async function test() {
  const { data, error } = await supabase.from('inventory').select('*').limit(1);
  if (error) {
    console.error('Error fetching inventory:', error);
  } else if (data && data.length > 0) {
    console.log('Columns in inventory:', Object.keys(data[0]));
  } else {
    console.log('inventory is empty or exists.');
  }
}
test();

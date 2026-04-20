import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://emqtgyntrpounnmssxcf.supabase.co', 
  'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo'
);

async function test() {
  const { data, error } = await supabase.from('customers').select('*').limit(1);
  console.log('Row:', data);
  console.log('Error:', error);
}
test();

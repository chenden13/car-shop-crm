const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function probePurchases() {
  console.log('--- Probing purchase_records Columns ---');
  // Try inserting with a fake column to see what happens
  const { error } = await supabase.from('purchase_records').insert({ non_existent: 1 });
  if (error) {
    console.log('Error Message:', error.message);
  }
}

probePurchases();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { error } = await supabase.from('inventory').insert([{ non_existent_column: 1 }]);
  console.log('Error message for non-existent column:', error.message);
}

checkColumns();

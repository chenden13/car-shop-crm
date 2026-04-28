const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function probeColumns() {
  console.log('--- Probing Columns ---');
  // 嘗試不加任何特定欄位，看看能不能獲取現有的結構
  const { data, error } = await supabase.from('inventory').select('*').limit(1);
  if (error) {
    console.error('Probe Error:', error);
  } else {
    console.log('Columns:', data.length > 0 ? Object.keys(data[0]) : 'Empty table');
  }
}

probeColumns();

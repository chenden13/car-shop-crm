const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAllData() {
  console.log('--- 正在執行資料庫全面清空 (不保留模擬資料) ---');
  
  const tables = [
    'customers', 
    'inventory_logs', 
    'inventory', 
    'purchase_records', 
    'finance_records'
  ];

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', 'this_is_a_dummy_id_to_trigger_full_delete');
      
    if (error) {
      console.error(`❌ 清除 ${table} 失敗:`, error.message);
    } else {
      console.log(`✅ 已清空 ${table} 資料表`);
    }
  }

  console.log('--- ✨ 所有業務資料已清空，您可以開始重新匯入了 ✨ ---');
}

clearAllData();

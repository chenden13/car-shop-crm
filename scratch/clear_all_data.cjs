const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAllData() {
  console.log('⚠️ 正在執行全系統資料清空程序 ⚠️');

  const tables = ['customers', 'inventory', 'inventory_logs', 'purchase_records', 'finance_records'];

  for (const table of tables) {
    console.log(`正在清空 ${table} ...`);
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', 'ignore_all_to_delete_everything_forcefully_9999'); // 刪除所有不等於此冗餘 ID 的資料 (即全部)

    if (error) {
      console.warn(`❌ 清空 ${table} 失敗 (可能表格不存在或權限限制):`, error.message);
    } else {
      console.log(`✅ ${table} 已清空`);
    }
  }

  console.log('\n--- ✨ 全系統資料已清空，您可以開始正式匯入資料 ✨ ---');
}

clearAllData();

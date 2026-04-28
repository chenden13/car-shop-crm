const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearData() {
  console.log('--- 正在清除資料庫原有資料 ---');
  
  const { error: delError } = await supabase
    .from('customers')
    .delete()
    .neq('id', 'SYSTEM_KEEP_ALIVE_IF_ANY'); // Delete everything
    
  if (delError) {
    console.error('❌ 清除舊資料失敗:', delError);
    return;
  }
  
  console.log('✅ 已成功清空所有客戶資料！您可以開始重新匯入了。');
}

clearData();

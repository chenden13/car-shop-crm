const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearScheduledData() {
  console.log('--- 正在清除所有「待施工/已付訂」排程資料 ---');
  
  const { error } = await supabase
    .from('customers')
    .delete()
    .in('status', ['scheduled', 'deposit']);
    
  if (error) {
    console.error('❌ 清除失敗:', error);
  } else {
    console.log('✅ 已成功將待施工排程區清空');
  }
}

clearScheduledData();

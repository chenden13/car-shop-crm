const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  console.log('--- 嘗試建立 photos bucket ---');
  const { data, error } = await supabase.storage.createBucket('photos', {
    public: true
  });
  
  if (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ photos bucket 已經存在。');
    } else {
      console.error('❌ 建立失敗 (可能權限不足):', error.message);
      console.log('請手動登入 Supabase 後台，建立一個名為 "photos" 的 Public Bucket。');
    }
  } else {
    console.log('✨ 成功建立 photos bucket！');
  }
}

createBucket();

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  console.log('--- 測試照片上傳 ---');
  const dummyContent = 'test photo content';
  const path = 'test_folder/test_file.txt';
  
  const { data, error } = await supabase.storage.from('photos').upload(path, dummyContent, {
    contentType: 'text/plain',
    upsert: true
  });
  
  if (error) {
    console.error('❌ 上傳失敗:', error.message);
    console.log('錯誤細節:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ 上傳成功:', data.path);
  }
}

testUpload();

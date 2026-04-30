import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearData() {
  console.log('--- 正在開始清空資料庫 ---');

  const tables = [
    'finance_settlements',
    'finance_records',
    'purchase_records',
    'inventory_logs',
    'inventory',
    'customers'
  ];

  for (const table of tables) {
    console.log(`正在清空表格: ${table}...`);
    const { error } = await supabase.from(table).delete().neq('id', '0'); 
    if (error) {
      console.error(`清空 ${table} 失敗:`, error.message);
    } else {
      console.log(`${table} 已清空。`);
    }
  }

  console.log('--- 正在清空 Storage (photos) ---');
  try {
    const { data: folders, error: listError } = await supabase.storage.from('photos').list('');
    if (listError) throw listError;

    if (folders && folders.length > 0) {
      for (const item of folders) {
        console.log(`正在刪除 Storage 項目: ${item.name}...`);
        // Note: list only lists the first level. If there are subfolders, it might be more complex.
        // But for this project, files are usually prefixed with customer ID as folders or flat files.
        const { data: subFiles } = await supabase.storage.from('photos').list(item.name);
        if (subFiles && subFiles.length > 0) {
           const toDelete = subFiles.map(f => `${item.name}/${f.name}`);
           await supabase.storage.from('photos').remove(toDelete);
        }
        await supabase.storage.from('photos').remove([item.name]);
      }
      console.log('Storage 已清空。');
    } else {
      console.log('Storage 內無資料。');
    }
  } catch (err) {
    console.warn('Storage 清空失敗 (可能權限不足或 bucket 不存在):', err.message);
  }

  console.log('--- 所有資料清空完成 ---');
}

clearData();

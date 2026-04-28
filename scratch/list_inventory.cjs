const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listInventory() {
  console.log('--- Current Inventory in DB ---');
  const { data, error } = await supabase.from('inventory').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Total items:', data.length);
    data.forEach(item => {
      console.log(`ID: ${item.id}, Brand: ${item.brand}, Color: ${item.color}, Loc: ${JSON.stringify(item.location || {z:item.zone, s:item.section, sl:item.slot})}`);
    });
  }

  console.log('--- Current Logs in DB ---');
  const { data: logs, error: logsError } = await supabase.from('inventory_logs').select('*').order('timestamp', { ascending: false }).limit(5);
  if (logsError) {
    console.error('Error logs:', logsError);
  } else {
    logs.forEach(log => {
      console.log(`Time: ${log.timestamp}, Action: ${log.action}, Details: ${log.details}`);
    });
  }
}

listInventory();

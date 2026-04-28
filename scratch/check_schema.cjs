const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('--- Checking Inventory Schema ---');
  const { data, error } = await supabase.from('inventory').select('*').limit(1);
  if (error) {
    console.error('Error fetching inventory:', error);
  } else {
    console.log('Inventory first row keys:', data.length > 0 ? Object.keys(data[0]) : 'No data');
  }

  const { data: logs, error: logsError } = await supabase.from('inventory_logs').select('*').limit(1);
  if (logsError) {
    console.error('Error fetching logs:', logsError);
  } else {
    console.log('Logs first row keys:', logs.length > 0 ? Object.keys(logs[0]) : 'No data');
  }
}

checkSchema();

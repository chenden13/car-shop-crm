const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('--- Testing Manual Insert ---');
  const testItem = {
    id: `TEST-${Date.now()}`,
    brand: 'TEST',
    color: 'RED',
    current_meters: 10,
    last_updated: '2026-01-01',
    zone: 'A',
    section: 1,
    slot: 1
  };
  
  const { data, error } = await supabase.from('inventory').insert(testItem).select();
  if (error) {
    console.error('Insert Error:', error);
  } else {
    console.log('Insert Success! Data:', data);
  }
}

testInsert();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = (match[2] || '').trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

function normalizePhone(p) {
  if (!p) return '';
  let str = String(p).replace(/[^0-9]/g, '');
  if (str.startsWith('8869')) {
    str = '09' + str.slice(4);
  } else if (str.length === 9 && str.startsWith('9')) {
    str = '0' + str;
  }
  return str;
}

function cleanStr(s) {
  if (!s) return '';
  return String(s).trim();
}

async function doImportAndUpdate() {
  console.log("=== 1. Reading Excel '正確版總表.xlsx' ===");
  const wb = XLSX.readFile('正確版總表.xlsx');

  // Sheet 2: 工作表1
  const sheet2 = wb.Sheets['工作表1'];
  const data2 = XLSX.utils.sheet_to_json(sheet2, { header: 1 });
  const missingCandidates = [];

  data2.forEach((rowArray, i) => {
    if (!Array.isArray(rowArray) || rowArray.length === 0) return;
    const values = rowArray.map(v => String(v || '').trim()).filter(Boolean);
    if (values.length === 0) return;

    let phone = '';
    let name = '';
    let plate = '';
    let model = '';
    let mainService = '';
    let notes = '';

    rowArray.forEach(val => {
      const s = String(val || '').trim();
      const normP = normalizePhone(s);
      if (normP.length === 10 && normP.startsWith('09')) {
        phone = normP;
      } else if (!name && s.length >= 2 && s.length <= 15 && !/[0-9]/.test(s) && !s.includes('@') && !s.includes('/') && !s.includes('http')) {
        name = s;
      } else if (!plate && /^[A-Z0-9]{3,4}-[A-Z0-9]{3,4}$/i.test(s)) {
        plate = s;
      } else if (!model && (s.includes('Model') || s.includes('Focus') || s.includes('Arteon') || s.includes('Tucson') || s.includes('CIVIC') || s.includes('Kuga') || s.includes('Benz') || s.includes('981'))) {
        model = s;
      } else if (s.includes('改色') || s.includes('犀牛皮') || s.includes('鍍膜') || s.includes('局部')) {
        mainService = s;
      } else if (s.length > 10) {
        notes += s + ' ';
      }
    });

    if (name || phone || plate) {
      missingCandidates.push({
        rowIndex: i + 1,
        name,
        phone,
        plate,
        model,
        mainService,
        notes: notes.trim()
      });
    }
  });

  // Fetch current CRM customers to filter out any already existing by phone or name+plate
  let dbCustomers = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase.from('customers').select('*').range(from, from + pageSize - 1);
    if (error) throw error;
    if (data && data.length > 0) {
      dbCustomers = dbCustomers.concat(data);
      from += pageSize;
    } else {
      hasMore = false;
    }
    if (data && data.length < pageSize) hasMore = false;
  }

  const dbPhoneSet = new Set(dbCustomers.map(c => normalizePhone(c.phone)).filter(Boolean));
  const dbNameSet = new Set(dbCustomers.map(c => cleanStr(c.name).toUpperCase()).filter(Boolean));

  // 14 missing customers to import
  const toImport = missingCandidates.filter(item => {
    const p = item.phone;
    const n = cleanStr(item.name).toUpperCase();
    return !dbPhoneSet.has(p) && !dbNameSet.has(n);
  });

  console.log(`\n=== 2. Importing ${toImport.length} Missing Customers to Supabase CRM ===`);

  for (let i = 0; i < toImport.length; i++) {
    const cust = toImport[i];
    const newId = `C-IMP-${Date.now()}-${i+1}`;
    const payload = {
      id: newId,
      name: cust.name || '未命名客戶',
      phone: cust.phone || '',
      plate_number: cust.plate || '',
      brand: '',
      model: cust.model || '',
      status: 'completed',
      total_amount: 0,
      cost: 0,
      revenue: 0,
      data: {
        mainService: cust.mainService || '',
        notes: cust.notes || '',
        importedFrom: '正確版總表-工作表1',
        importedAt: new Date().toISOString()
      }
    };

    const { error } = await supabase.from('customers').insert(payload);
    if (error) {
      console.error(`Failed to insert ${cust.name}:`, error);
    } else {
      console.log(`  [${i+1}/${toImport.length}] ✅ Inserted: ${cust.name} | Phone: ${cust.phone} | Plate: ${cust.plate} | ID: ${newId}`);
    }
  }

  // 3. Update 13 CRM entries missing phone numbers
  console.log("\n=== 3. Updating CRM records with missing phone numbers ===");
  const updates = [
    { name: '陳維正', phone: '0937885550' },
    { name: '鄭翔元', phone: '0912291669' },
    { name: '許晏誠', phone: '0918932670' },
    { name: '曹哲寧', phone: '0908759913' },
    { name: '吳東翰', phone: '0922504525', plate: 'EAF-7677' },
    { name: '蔡先生', phone: '0926121740' },
    { name: '徐先生', phone: '0952082326' },
    { name: '李先生', phone: '0980522838', plate: 'REB-8733' },
    { name: '吳威宏', phone: '0912473216', plate: 'EAD-9966' },
    { name: '陳先生', phone: '0928492585' },
    { name: '奎丁', phone: '0905185087' },
    { name: '冰蹦拉', phone: '0905185087' },
    { name: '吳秉翰', phone: '0988006456' }
  ];

  for (const item of updates) {
    let query = supabase.from('customers').update({ phone: item.phone }).eq('name', item.name).or('phone.is.null,phone.eq.');
    if (item.plate) {
      query = query.eq('plate_number', item.plate);
    }
    const { data, error } = await query.select();
    if (error) {
      console.error(`Failed to update phone for ${item.name}:`, error);
    } else {
      console.log(`  ✅ Updated phone for ${item.name} (${item.phone}): updated ${data ? data.length : 0} rows`);
    }
  }

  console.log("\n=== ALL IMPORTS AND UPDATES COMPLETED SUCCESSFULLY ===");
}

doImportAndUpdate().catch(console.error);

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

async function runCrossCheck() {
  let dbCustomers = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (data && data.length > 0) {
      dbCustomers = dbCustomers.concat(data);
      from += pageSize;
    } else {
      hasMore = false;
    }
    if (data && data.length < pageSize) hasMore = false;
  }

  // Create CRM Lookups
  const dbPhoneMap = new Map();
  const dbNameMap = new Map();
  const dbIdMap = new Map();

  dbCustomers.forEach(c => {
    const phone = normalizePhone(c.phone);
    const name = cleanStr(c.name).toUpperCase();
    const id = cleanStr(c.id).toUpperCase();

    if (phone) {
      if (!dbPhoneMap.has(phone)) dbPhoneMap.set(phone, []);
      dbPhoneMap.get(phone).push(c);
    }
    if (name) {
      if (!dbNameMap.has(name)) dbNameMap.set(name, []);
      dbNameMap.get(name).push(c);
    }
    if (id) {
      if (!dbIdMap.has(id)) dbIdMap.set(id, []);
      dbIdMap.get(id).push(c);
    }
  });

  const wb = XLSX.readFile('正確版總表.xlsx');

  const allExcelRows = [];

  // Sheet 1: 客戶資料統整
  const sheet1 = wb.Sheets['客戶資料統整'];
  const data1 = XLSX.utils.sheet_to_json(sheet1, { defval: '' });
  data1.forEach((row, i) => {
    const id = cleanStr(row['編號']);
    const name = cleanStr(row['姓名']);
    const rawPhone = String(row['電話'] || '').trim();
    const phone = normalizePhone(rawPhone);
    const plate = cleanStr(row['車牌']);
    const model = cleanStr(row['車種']);
    const mainService = cleanStr(row['施工項目']);
    const brand = cleanStr(row['品牌']);
    const filmColor = cleanStr(row['細項']);
    const totalAmount = Number(row[' 金額 ']) || Number(row['金額']) || 0;

    if (name || phone || id || plate) {
      allExcelRows.push({
        sourceSheet: '客戶資料統整',
        rowIndex: i + 2,
        id,
        name,
        rawPhone,
        phone,
        plate,
        model,
        brand,
        mainService,
        filmColor,
        totalAmount,
        rawRow: row
      });
    }
  });

  // Sheet 2: 工作表1
  const sheet2 = wb.Sheets['工作表1'];
  const data2 = XLSX.utils.sheet_to_json(sheet2, { header: 1 });
  data2.forEach((rowArray, i) => {
    if (!Array.isArray(rowArray) || rowArray.length === 0) return;
    const values = rowArray.map(v => String(v || '').trim()).filter(Boolean);
    if (values.length === 0) return;

    let phone = '';
    let name = '';
    let plate = '';
    let model = '';
    let mainService = '';

    rowArray.forEach(val => {
      const s = String(val || '').trim();
      const normP = normalizePhone(s);
      if (normP.length === 10 && normP.startsWith('09')) {
        phone = normP;
      } else if (!name && s.length >= 2 && s.length <= 15 && !/[0-9]/.test(s) && !s.includes('@') && !s.includes('/') && !s.includes('http')) {
        name = s;
      } else if (!plate && /^[A-Z0-9]{3,4}-[A-Z0-9]{3,4}$/i.test(s)) {
        plate = s;
      } else if (!model && (s.includes('Model') || s.includes('Focus') || s.includes('Arteon') || s.includes('Tucson') || s.includes('CIVIC') || s.includes('Kuga') || s.includes('Benz'))) {
        model = s;
      } else if (s.includes('改色') || s.includes('犀牛皮') || s.includes('鍍膜') || s.includes('局部')) {
        mainService = s;
      }
    });

    if (name || phone || plate) {
      allExcelRows.push({
        sourceSheet: '工作表1',
        rowIndex: i + 1,
        id: '',
        name,
        rawPhone: phone,
        phone,
        plate,
        model,
        brand: '',
        mainService,
        filmColor: '',
        totalAmount: 0,
        rawRow: rowArray
      });
    }
  });

  // Sheet 3: 補寄禮包
  const sheet3 = wb.Sheets['補寄禮包'];
  const data3 = XLSX.utils.sheet_to_json(sheet3, { header: 1 });
  data3.forEach((rowArray, i) => {
    if (!Array.isArray(rowArray) || rowArray.length === 0) return;
    let name = String(rowArray[0] || '').trim();
    let phone = normalizePhone(rowArray[1]);
    let address = String(rowArray[2] || '').trim();

    if (name || phone) {
      allExcelRows.push({
        sourceSheet: '補寄禮包',
        rowIndex: i + 1,
        id: '',
        name,
        rawPhone: phone,
        phone,
        plate: '',
        model: '',
        brand: '',
        mainService: '',
        filmColor: '',
        totalAmount: 0,
        address,
        rawRow: rowArray
      });
    }
  });

  // Categorize
  const missingFromCrm = [];
  const phoneMatched = [];
  const idMatched = [];
  const nameMatchedOnly = [];

  allExcelRows.forEach(item => {
    const normName = item.name.toUpperCase();
    const phone = item.phone;
    const id = item.id.toUpperCase();

    const dbPhoneMatches = phone ? (dbPhoneMap.get(phone) || []) : [];
    const dbNameMatches = normName ? (dbNameMap.get(normName) || []) : [];
    const dbIdMatches = id ? (dbIdMap.get(id) || []) : [];

    const hasPhoneMatch = dbPhoneMatches.length > 0;
    const hasNameMatch = dbNameMatches.length > 0;
    const hasIdMatch = dbIdMatches.length > 0;

    if (!hasPhoneMatch && !hasNameMatch && !hasIdMatch) {
      missingFromCrm.push(item);
    } else if (hasPhoneMatch) {
      phoneMatched.push({ item, db: dbPhoneMatches });
    } else if (hasIdMatch) {
      idMatched.push({ item, db: dbIdMatches });
    } else if (hasNameMatch) {
      nameMatchedOnly.push({ item, db: dbNameMatches });
    }
  });

  console.log("=== COMPREHENSIVE SUMMARY ===");
  console.log(`CRM Total Customers: ${dbCustomers.length}`);
  console.log(`Excel Total Rows Parsed: ${allExcelRows.length}`);
  console.log(`  - Sheet '客戶資料統整': ${allExcelRows.filter(r => r.sourceSheet === '客戶資料統整').length}`);
  console.log(`  - Sheet '工作表1': ${allExcelRows.filter(r => r.sourceSheet === '工作表1').length}`);
  console.log(`  - Sheet '補寄禮包': ${allExcelRows.filter(r => r.sourceSheet === '補寄禮包').length}`);
  console.log("-----------------------------------------");
  console.log(`1. COMPLETELY MISSING from CRM (No Phone, Name, or ID match): ${missingFromCrm.length}`);
  console.log(`2. Matched by Phone: ${phoneMatched.length}`);
  console.log(`3. Matched by ID (Phone didn't match/empty): ${idMatched.length}`);
  console.log(`4. Matched by Name ONLY (Phone was EMPTY or DIFFERENT): ${nameMatchedOnly.length}`);

  console.log("\n--- LIST OF COMPLETELY MISSING FROM CRM ---");
  missingFromCrm.forEach((r, idx) => {
    console.log(`${idx + 1}. [Sheet: ${r.sourceSheet} Row ${r.rowIndex}] ${r.name || '無姓名'} | Phone: ${r.phone || '無電話'} | ID: ${r.id || '無ID'} | Plate: ${r.plate || '無車牌'} | Model: ${r.model || '無車種'} | Service: ${r.mainService || '無施工'}`);
  });

  console.log("\n--- LIST OF NAME-ONLY MATCHES (Where Phone in Excel was EMPTY or DIFFERENT from CRM) ---");
  nameMatchedOnly.forEach((r, idx) => {
    const dbPhones = r.db.map(d => d.phone || '無電話').join(', ');
    console.log(`${idx + 1}. [Sheet: ${r.item.sourceSheet} Row ${r.item.rowIndex}] Name: ${r.item.name} | Excel Phone: '${r.item.phone}' | CRM DB Phones: '${dbPhones}' | Model: ${r.item.model}`);
  });
}

runCrossCheck().catch(console.error);

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

async function auditAll() {
  console.log("Fetching all CRM customers...");
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

  // CRM maps
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

  // Sheet 1: 客戶資料統整
  const sheet1 = wb.Sheets['客戶資料統整'];
  const data1 = XLSX.utils.sheet_to_json(sheet1, { defval: '' });
  const rowsSheet1 = [];
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
      rowsSheet1.push({
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
  const rowsSheet2 = [];
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
      rowsSheet2.push({
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
  const rowsSheet3 = [];
  data3.forEach((rowArray, i) => {
    if (!Array.isArray(rowArray) || rowArray.length === 0) return;
    let name = String(rowArray[0] || '').trim();
    let phone = normalizePhone(rowArray[1]);
    let address = String(rowArray[2] || '').trim();

    if (name || phone) {
      rowsSheet3.push({
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

  const allExcelRows = [...rowsSheet1, ...rowsSheet2, ...rowsSheet3];

  console.log(`=== Total Excel Rows across 3 sheets: ${allExcelRows.length} ===`);

  // Check 1: Missing in CRM completely
  const missingFromCrm = allExcelRows.filter(r => {
    const id = cleanStr(r.id).toUpperCase();
    const phone = r.phone;
    const name = cleanStr(r.name).toUpperCase();

    const idMatch = id ? dbIdMap.has(id) : false;
    const phoneMatch = phone ? dbPhoneMap.has(phone) : false;
    const nameMatch = name ? dbNameMap.has(name) : false;

    return !idMatch && !phoneMatch && !nameMatch;
  });

  console.log(`\n=== 1. 完全未存在於 CRM 的客戶 (${missingFromCrm.length} 筆) ===`);
  missingFromCrm.forEach((r, idx) => {
    console.log(`${idx + 1}. [${r.sourceSheet} 第${r.rowIndex}行] 姓名: ${r.name || '無'} | 電話: ${r.phone || '無'} | 車牌: ${r.plate || '無'} | 車種: ${r.model || '無'}`);
  });

  // Check 2: Missing Phone Numbers in CRM where user or excel has phone
  const crmMissingPhone = [];
  dbCustomers.forEach(c => {
    const p = normalizePhone(c.phone);
    if (!p) {
      // Find match in Excel by name or plate
      const name = cleanStr(c.name).toUpperCase();
      const plate = cleanStr(c.plate_number).toUpperCase();
      const excelMatches = allExcelRows.filter(e => {
        if (name && cleanStr(e.name).toUpperCase() === name) return true;
        if (plate && cleanStr(e.plate).toUpperCase() === plate) return true;
        return false;
      });
      const withPhone = excelMatches.filter(e => e.phone);
      crmMissingPhone.push({
        crm: c,
        excelMatchesWithPhone: withPhone
      });
    }
  });

  console.log(`\n=== 2. CRM 中缺少電話的客戶 (共 ${crmMissingPhone.length} 筆) ===`);
  const crmMissingWithFoundPhone = crmMissingPhone.filter(item => item.excelMatchesWithPhone.length > 0);
  console.log(`其中可從 Excel 補齊電話的有 ${crmMissingWithFoundPhone.length} 筆:`);
  crmMissingWithFoundPhone.forEach((item, idx) => {
    const foundPhones = item.excelMatchesWithPhone.map(e => e.phone).join(', ');
    console.log(`${idx + 1}. CRM ID: ${item.crm.id} | 姓名: ${item.crm.name} | 車牌: ${item.crm.plate_number} -> 補齊電話: ${foundPhones}`);
  });

  // Check 3: Duplicate IDs
  const idToExcel = new Map();
  const idToCrm = new Map();

  allExcelRows.filter(r => r.id).forEach(r => {
    const key = r.id.toUpperCase();
    if (!idToExcel.has(key)) idToExcel.set(key, []);
    idToExcel.get(key).push(r);
  });

  dbCustomers.filter(c => c.id).forEach(c => {
    const key = cleanStr(c.id).toUpperCase();
    if (!idToCrm.has(key)) idToCrm.set(key, []);
    idToCrm.get(key).push(c);
  });

  const duplicateIdReport = [];
  // All unique IDs in Excel and CRM
  const allIds = new Set([...idToExcel.keys(), ...idToCrm.keys()]);
  allIds.forEach(id => {
    const exList = idToExcel.get(id) || [];
    const dbList = idToCrm.get(id) || [];
    if (exList.length > 1 || dbList.length > 1 || (exList.length > 0 && dbList.length > 0)) {
      duplicateIdReport.push({
        id,
        excelCount: exList.length,
        crmCount: dbList.length,
        excelEntries: exList,
        crmEntries: dbList
      });
    }
  });

  console.log(`\n=== 3. 重複編號 (Duplicate IDs) (${duplicateIdReport.length} 組) ===`);

  // Check 4: Duplicate Phones
  const phoneToExcel = new Map();
  const phoneToCrm = new Map();

  allExcelRows.filter(r => r.phone).forEach(r => {
    if (!phoneToExcel.has(r.phone)) phoneToExcel.set(r.phone, []);
    phoneToExcel.get(r.phone).push(r);
  });

  dbCustomers.filter(c => c.phone).forEach(c => {
    const p = normalizePhone(c.phone);
    if (p) {
      if (!phoneToCrm.has(p)) phoneToCrm.set(p, []);
      phoneToCrm.get(p).push(c);
    }
  });

  const duplicatePhoneReport = [];
  const allPhones = new Set([...phoneToExcel.keys(), ...phoneToCrm.keys()]);
  allPhones.forEach(p => {
    const exList = phoneToExcel.get(p) || [];
    const dbList = phoneToCrm.get(p) || [];
    if (exList.length > 1 || dbList.length > 1) {
      duplicatePhoneReport.push({
        phone: p,
        excelCount: exList.length,
        crmCount: dbList.length,
        excelEntries: exList,
        crmEntries: dbList
      });
    }
  });

  console.log(`\n=== 4. 重複電話 (Duplicate Phone Numbers) (${duplicatePhoneReport.length} 組) ===`);

  // Check 5: Duplicate Names
  const nameToExcel = new Map();
  const nameToCrm = new Map();

  allExcelRows.filter(r => r.name).forEach(r => {
    const key = cleanStr(r.name).toUpperCase();
    if (!nameToExcel.has(key)) nameToExcel.set(key, []);
    nameToExcel.get(key).push(r);
  });

  dbCustomers.filter(c => c.name).forEach(c => {
    const key = cleanStr(c.name).toUpperCase();
    if (key) {
      if (!nameToCrm.has(key)) nameToCrm.set(key, []);
      nameToCrm.get(key).push(c);
    }
  });

  const duplicateNameReport = [];
  const allNames = new Set([...nameToExcel.keys(), ...nameToCrm.keys()]);
  allNames.forEach(n => {
    const exList = nameToExcel.get(n) || [];
    const dbList = nameToCrm.get(n) || [];
    if (exList.length > 1 || dbList.length > 1) {
      duplicateNameReport.push({
        name: n,
        excelCount: exList.length,
        crmCount: dbList.length,
        excelEntries: exList,
        crmEntries: dbList
      });
    }
  });

  console.log(`\n=== 5. 重複姓名 (Duplicate Names) (${duplicateNameReport.length} 組) ===`);

}

auditAll().catch(console.error);

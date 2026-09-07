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

async function processAll() {
  console.log("=== 1. Fetching all CRM customers ===");
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

  // Lookups
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

  console.log("=== 2. Parsing Excel 正確版總表.xlsx ===");
  const wb = XLSX.readFile('正確版總表.xlsx');

  // Sheet 1
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
        notes: cleanStr(row['備註'])
      });
    }
  });

  // Sheet 2
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
      } else if (!model && (s.includes('Model') || s.includes('Focus') || s.includes('Arteon') || s.includes('Tucson') || s.includes('CIVIC') || s.includes('Kuga') || s.includes('Benz'))) {
        model = s;
      } else if (s.includes('改色') || s.includes('犀牛皮') || s.includes('鍍膜') || s.includes('局部')) {
        mainService = s;
      } else if (s.length > 10) {
        notes += s + ' ';
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
        notes: notes.trim()
      });
    }
  });

  // Sheet 3
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
        notes: `補寄禮包地址: ${address}`
      });
    }
  });

  const allExcelRows = [...rowsSheet1, ...rowsSheet2, ...rowsSheet3];

  // 1. Missing from CRM
  const missingFromCrm = allExcelRows.filter(r => {
    const id = cleanStr(r.id).toUpperCase();
    const phone = r.phone;
    const name = cleanStr(r.name).toUpperCase();

    const idMatch = id ? dbIdMap.has(id) : false;
    const phoneMatch = phone ? dbPhoneMap.has(phone) : false;
    const nameMatch = name ? dbNameMap.has(name) : false;

    return !idMatch && !phoneMatch && !nameMatch;
  });

  // 2. Duplicate IDs
  const dupIdMap = new Map();
  allExcelRows.forEach(r => {
    if (r.id) {
      const id = r.id.toUpperCase();
      if (!dupIdMap.has(id)) dupIdMap.set(id, { id, excelRows: [], crmRows: dbIdMap.get(id) || [] });
      dupIdMap.get(id).excelRows.push(r);
    }
  });
  const duplicateIds = Array.from(dupIdMap.values()).filter(g => g.excelRows.length > 1 || g.crmRows.length > 1);

  // 3. Duplicate Phones
  const dupPhoneMap = new Map();
  allExcelRows.forEach(r => {
    if (r.phone) {
      const p = r.phone;
      if (!dupPhoneMap.has(p)) dupPhoneMap.set(p, { phone: p, excelRows: [], crmRows: dbPhoneMap.get(p) || [] });
      dupPhoneMap.get(p).excelRows.push(r);
    }
  });
  dbCustomers.forEach(c => {
    const p = normalizePhone(c.phone);
    if (p && !dupPhoneMap.has(p)) {
      dupPhoneMap.set(p, { phone: p, excelRows: [], crmRows: dbPhoneMap.get(p) || [] });
    }
  });
  const duplicatePhones = Array.from(dupPhoneMap.values()).filter(g => g.excelRows.length > 1 || g.crmRows.length > 1);

  // 4. Duplicate Names
  const dupNameMap = new Map();
  allExcelRows.forEach(r => {
    if (r.name) {
      const n = cleanStr(r.name).toUpperCase();
      if (!dupNameMap.has(n)) dupNameMap.set(n, { name: r.name, excelRows: [], crmRows: dbNameMap.get(n) || [] });
      dupNameMap.get(n).excelRows.push(r);
    }
  });
  dbCustomers.forEach(c => {
    const n = cleanStr(c.name).toUpperCase();
    if (n && !dupNameMap.has(n)) {
      dupNameMap.set(n, { name: c.name, excelRows: [], crmRows: dbNameMap.get(n) || [] });
    }
  });
  const duplicateNames = Array.from(dupNameMap.values()).filter(g => g.excelRows.length > 1 || g.crmRows.length > 1);

  // 5. Specifically Update 汪君翰's phone number in CRM!
  console.log("\n=== UPDATING 汪君翰's Phone Number in Supabase DB ===");
  const wangCrm = dbCustomers.find(c => c.name === '汪君翰' && !c.phone);
  if (wangCrm) {
    const { error: wangErr } = await supabase
      .from('customers')
      .update({ phone: '0989912500' })
      .eq('id', wangCrm.id);
    if (wangErr) {
      console.error("Failed to update 汪君翰 phone:", wangErr);
    } else {
      console.log(`✅ Successfully updated 汪君翰 (ID: ${wangCrm.id}) phone to 0989912500!`);
    }
  } else {
    console.log("汪君翰 record check:", dbCustomers.filter(c => c.name === '汪君翰'));
  }

  // Export Separated Excel File containing 4 sheets:
  // Sheet 1: 遺漏客戶 (Missing Customers)
  // Sheet 2: 重複編號 (Duplicate IDs)
  // Sheet 3: 重複電話 (Duplicate Phones)
  // Sheet 4: 重複姓名 (Duplicate Names)

  const outputWb = XLSX.utils.book_new();

  // 1. Missing Sheet
  const missingData = missingFromCrm.map(r => ({
    '來源分頁': r.sourceSheet,
    '試算表行數': r.rowIndex,
    '編號': r.id,
    '姓名': r.name,
    '電話': r.phone || r.rawPhone,
    '車牌': r.plate,
    '車種': r.model,
    '主施工項目': r.mainService,
    '備註': r.notes
  }));
  const missingWs = XLSX.utils.json_to_sheet(missingData);
  XLSX.utils.book_append_sheet(outputWb, missingWs, '遺漏客戶名單');

  // 2. Duplicate IDs Sheet
  const dupIdData = [];
  duplicateIds.forEach(g => {
    g.excelRows.forEach(r => {
      dupIdData.push({
        '重複編號': g.id,
        '資料來源': `Excel (${r.sourceSheet} 第${r.rowIndex}行)`,
        '姓名': r.name,
        '電話': r.phone,
        '車牌': r.plate,
        '車種': r.model
      });
    });
    g.crmRows.forEach(r => {
      dupIdData.push({
        '重複編號': g.id,
        '資料來源': `CRM 資料庫 (ID: ${r.id})`,
        '姓名': r.name,
        '電話': r.phone,
        '車牌': r.plate_number,
        '車種': r.model
      });
    });
  });
  const dupIdWs = XLSX.utils.json_to_sheet(dupIdData);
  XLSX.utils.book_append_sheet(outputWb, dupIdWs, '重複編號');

  // 3. Duplicate Phones Sheet
  const dupPhoneData = [];
  duplicatePhones.forEach(g => {
    g.excelRows.forEach(r => {
      dupPhoneData.push({
        '重複電話': g.phone,
        '資料來源': `Excel (${r.sourceSheet} 第${r.rowIndex}行)`,
        '編號': r.id,
        '姓名': r.name,
        '車牌': r.plate,
        '車種': r.model
      });
    });
    g.crmRows.forEach(r => {
      dupPhoneData.push({
        '重複電話': g.phone,
        '資料來源': `CRM 資料庫 (ID: ${r.id})`,
        '編號': r.id,
        '姓名': r.name,
        '車牌': r.plate_number,
        '車種': r.model
      });
    });
  });
  const dupPhoneWs = XLSX.utils.json_to_sheet(dupPhoneData);
  XLSX.utils.book_append_sheet(outputWb, dupPhoneWs, '重複電話');

  // 4. Duplicate Names Sheet
  const dupNameData = [];
  duplicateNames.forEach(g => {
    g.excelRows.forEach(r => {
      dupNameData.push({
        '重複姓名': g.name,
        '資料來源': `Excel (${r.sourceSheet} 第${r.rowIndex}行)`,
        '編號': r.id,
        '電話': r.phone,
        '車牌': r.plate,
        '車種': r.model
      });
    });
    g.crmRows.forEach(r => {
      dupNameData.push({
        '重複姓名': g.name,
        '資料來源': `CRM 資料庫 (ID: ${r.id})`,
        '編號': r.id,
        '電話': r.phone,
        '車牌': r.plate_number,
        '車種': r.model
      });
    });
  });
  const dupNameWs = XLSX.utils.json_to_sheet(dupNameData);
  XLSX.utils.book_append_sheet(outputWb, dupNameWs, '重複姓名');

  const outputPath = path.resolve('scratch/CRM與正確版總表_比對與重複核對報告.xlsx');
  XLSX.writeFile(outputWb, outputPath);
  console.log(`\n✅ Generated Excel Report: ${outputPath}`);

  // Also save JSON summary
  const summaryJson = {
    totalCrmCustomers: dbCustomers.length,
    totalExcelRowsParsed: allExcelRows.length,
    missingCount: missingFromCrm.length,
    missingList: missingData,
    duplicateIdCount: duplicateIds.length,
    duplicatePhoneCount: duplicatePhones.length,
    duplicateNameCount: duplicateNames.length
  };

  fs.writeFileSync('scratch/audit_summary.json', JSON.stringify(summaryJson, null, 2));
  console.log(`✅ Generated JSON Summary: scratch/audit_summary.json`);
}

processAll().catch(console.error);

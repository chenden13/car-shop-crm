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
  }
  return str;
}

function normalizeStr(s) {
  if (!s) return '';
  return String(s).trim();
}

async function deepAudit() {
  console.log("=== 1. Fetching ALL customers from Supabase ===");
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

  console.log(`Total CRM customers: ${dbCustomers.length}`);

  // Create CRM Lookups
  const dbById = new Map();
  const dbByPhone = new Map();
  const dbByName = new Map();

  dbCustomers.forEach(c => {
    const id = normalizeStr(c.id);
    const phone = normalizePhone(c.phone);
    const name = normalizeStr(c.name);

    if (id) {
      if (!dbById.has(id)) dbById.set(id, []);
      dbById.get(id).push(c);
    }
    if (phone) {
      if (!dbByPhone.has(phone)) dbByPhone.set(phone, []);
      dbByPhone.get(phone).push(c);
    }
    if (name) {
      if (!dbByName.has(name)) dbByName.set(name, []);
      dbByName.get(name).push(c);
    }
  });

  console.log("\n=== 2. Inspecting All Sheets in 正確版總表.xlsx ===");
  const wb = XLSX.readFile('正確版總表.xlsx');

  wb.SheetNames.forEach(sheetName => {
    console.log(`\n--- SHEET: ${sheetName} ---`);
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`Total rows in sheet ${sheetName}: ${rows.length}`);
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      console.log(`Row ${i}:`, rows[i]);
    }
  });

  // Let's parse sheet '客戶資料統整' properly
  const sheet1 = wb.Sheets['客戶資料統整'];
  const excelData1 = XLSX.utils.sheet_to_json(sheet1, { defval: '' });

  // Let's parse sheet '工作表1'
  const sheet2 = wb.Sheets['工作表1'];
  const excelData2 = XLSX.utils.sheet_to_json(sheet2, { defval: '' });

  // Let's parse sheet '補寄禮包'
  const sheet3 = wb.Sheets['補寄禮包'];
  const excelData3 = XLSX.utils.sheet_to_json(sheet3, { defval: '' });

  console.log(`\nParsed counts:
  客戶資料統整: ${excelData1.length} rows
  工作表1: ${excelData2.length} rows
  補寄禮包: ${excelData3.length} rows`);

  // Let's inspect rows in 工作表1 and 補寄禮包
  console.log("\n=== Checking '工作表1' entries vs CRM ===");
  excelData2.forEach((r, idx) => {
    const values = Object.values(r).map(v => String(v).trim()).filter(Boolean);
    if (values.length > 0) {
      // Find any phone or name
      const phoneMatch = values.find(v => normalizePhone(v).length >= 9);
      const nameCandidate = values.find(v => v.length >= 2 && v.length <= 5 && !/[0-9]/.test(v));
      console.log(`Row ${idx + 2}: phoneCandidate=${phoneMatch}, nameCandidate=${nameCandidate}, full=`, values);
    }
  });

  console.log("\n=== Checking '補寄禮包' entries vs CRM ===");
  excelData3.forEach((r, idx) => {
    const values = Object.values(r).map(v => String(v).trim()).filter(Boolean);
    if (values.length > 0) {
      const phoneMatch = values.find(v => normalizePhone(v).length >= 9);
      const nameCandidate = values.find(v => v.length >= 2 && v.length <= 5 && !/[0-9]/.test(v));
      console.log(`Row ${idx + 2}: phoneCandidate=${phoneMatch}, nameCandidate=${nameCandidate}, full=`, values);
    }
  });

}

deepAudit().catch(console.error);

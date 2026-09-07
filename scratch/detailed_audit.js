import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

// Parse .env
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
  return String(s).trim().toUpperCase();
}

async function runAudit() {
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

  console.log(`Fetched ${dbCustomers.length} total rows from Supabase 'customers' table.`);

  // Build DB Index Maps
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

  console.log("\n=== 2. Parsing '正確版總表.xlsx' ===");
  const wb = XLSX.readFile('正確版總表.xlsx');
  
  // Combine rows from all sheets or sheet '客戶資料統整'
  const sheetName = '客戶資料統整';
  const sheet = wb.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  console.log(`Sheet '${sheetName}' has ${rawRows.length} rows.`);

  const excelCustomers = rawRows.map((row, index) => {
    const id = normalizeStr(row['編號']);
    const name = normalizeStr(row['姓名']);
    const rawPhone = String(row['電話'] || '').trim();
    const phone = normalizePhone(rawPhone);
    const plate = normalizeStr(row['車牌']);
    const model = String(row['車種'] || '').trim();
    const brand = String(row['品牌'] || '').trim();
    const mainService = String(row['施工項目'] || '').trim();
    const filmColor = String(row['細項'] || '').trim();
    const totalAmount = Number(row[' 金額 ']) || Number(row['金額']) || 0;

    return {
      rowIndex: index + 2, // Row 1 is header
      id,
      name: String(row['姓名'] || '').trim(),
      normName: name,
      rawPhone,
      phone,
      plate,
      model,
      brand,
      mainService,
      filmColor,
      totalAmount,
      rawRow: row
    };
  }).filter(c => c.normName || c.phone || c.id || c.plate);

  console.log(`Parsed ${excelCustomers.length} non-empty customer entries from Excel.`);

  // Audit Categories:
  // 1. Missing in CRM (No match by Phone, Name, or ID in CRM)
  // 2. Duplicate ID inside Excel / matching CRM
  // 3. Duplicate Phone inside Excel / matching CRM
  // 4. Duplicate Name inside Excel / matching CRM
  // 5. Customer entries that match existing CRM records (Already in CRM)

  const missingFromCrm = [];
  const matchedInCrm = [];

  // Group by duplication types
  const dupIdGroup = new Map();
  const dupPhoneGroup = new Map();
  const dupNameGroup = new Map();

  // Also check Excel internal duplicates
  const excelIdFreq = new Map();
  const excelPhoneFreq = new Map();
  const excelNameFreq = new Map();

  excelCustomers.forEach(ec => {
    if (ec.id) excelIdFreq.set(ec.id, (excelIdFreq.get(ec.id) || 0) + 1);
    if (ec.phone) excelPhoneFreq.set(ec.phone, (excelPhoneFreq.get(ec.phone) || 0) + 1);
    if (ec.normName) excelNameFreq.set(ec.normName, (excelNameFreq.get(ec.normName) || 0) + 1);
  });

  excelCustomers.forEach(ec => {
    const dbMatchById = ec.id ? dbById.get(ec.id) : null;
    const dbMatchByPhone = ec.phone ? dbByPhone.get(ec.phone) : null;
    const dbMatchByName = ec.normName ? dbByName.get(ec.normName) : null;

    const hasMatch = !!(dbMatchById || dbMatchByPhone || dbMatchByName);

    const isDupId = (ec.id && (excelIdFreq.get(ec.id) > 1 || (dbMatchById && dbMatchById.length > 0)));
    const isDupPhone = (ec.phone && (excelPhoneFreq.get(ec.phone) > 1 || (dbMatchByPhone && dbMatchByPhone.length > 0)));
    const isDupName = (ec.normName && (excelNameFreq.get(ec.normName) > 1 || (dbMatchByName && dbMatchByName.length > 0)));

    if (!hasMatch) {
      missingFromCrm.push(ec);
    } else {
      matchedInCrm.push({
        excel: ec,
        dbMatchById,
        dbMatchByPhone,
        dbMatchByName
      });
    }

    if (isDupId) {
      if (!dupIdGroup.has(ec.id)) dupIdGroup.set(ec.id, { excelRows: [], dbRows: dbMatchById || [] });
      dupIdGroup.get(ec.id).excelRows.push(ec);
    }
    if (isDupPhone) {
      if (!dupPhoneGroup.has(ec.phone)) dupPhoneGroup.set(ec.phone, { excelRows: [], dbRows: dbMatchByPhone || [] });
      dupPhoneGroup.get(ec.phone).excelRows.push(ec);
    }
    if (isDupName) {
      if (!dupNameGroup.has(ec.normName)) dupNameGroup.set(ec.normName, { excelRows: [], dbRows: dbMatchByName || [] });
      dupNameGroup.get(ec.normName).excelRows.push(ec);
    }
  });

  console.log("\n=== AUDIT RESULTS ===");
  console.log(`Total Excel Entries Analyzed: ${excelCustomers.length}`);
  console.log(`Matched with CRM Database: ${matchedInCrm.length}`);
  console.log(`Completely Missing from CRM Database: ${missingFromCrm.length}`);
  console.log(`Duplicate ID groups (Excel or CRM): ${dupIdGroup.size}`);
  console.log(`Duplicate Phone groups (Excel or CRM): ${dupPhoneGroup.size}`);
  console.log(`Duplicate Name groups (Excel or CRM): ${dupNameGroup.size}`);

  if (missingFromCrm.length > 0) {
    console.log("\nSample Missing Customers:");
    console.dir(missingFromCrm.slice(0, 10), { depth: null });
  }

  // Print sample duplicate phones
  console.log("\nSample Duplicate Phone Groups:");
  let count = 0;
  for (const [phone, group] of dupPhoneGroup.entries()) {
    if (count >= 5) break;
    console.log(`Phone: ${phone}`);
    console.log(`  Excel rows (${group.excelRows.length}):`, group.excelRows.map(r => `Row ${r.rowIndex}: ${r.name} (${r.id})`));
    console.log(`  DB matches (${group.dbRows.length}):`, group.dbRows.map(r => `${r.name} (${r.id})`));
    count++;
  }
}

runAudit().catch(console.error);

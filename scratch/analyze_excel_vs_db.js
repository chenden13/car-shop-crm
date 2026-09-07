import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

// Parse .env manually
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
      value = value.replace(/(^"|"$)/g, '');
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("=== STEP 1: Fetching all customers from Supabase ===");
  let dbCustomers = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("DB Error:", error);
      process.exit(1);
    }
    if (data && data.length > 0) {
      dbCustomers = dbCustomers.concat(data);
      from += pageSize;
    } else {
      hasMore = false;
    }
    if (data && data.length < pageSize) hasMore = false;
  }

  console.log(`Total customers in Supabase DB: ${dbCustomers.length}`);

  // Format DB customer maps for quick lookup
  const dbById = new Map();
  const dbByPhone = new Map();
  const dbByName = new Map();

  // Helper to normalize phone numbers
  function normalizePhone(p) {
    if (!p) return '';
    let str = String(p).replace(/[^0-9]/g, '');
    if (str.startsWith('8869')) {
      str = '09' + str.slice(4);
    }
    return str;
  }

  dbCustomers.forEach(c => {
    const normPhone = normalizePhone(c.phone);
    if (c.id) {
      if (!dbById.has(c.id)) dbById.set(c.id, []);
      dbById.get(c.id).push(c);
    }
    if (normPhone) {
      if (!dbByPhone.has(normPhone)) dbByPhone.set(normPhone, []);
      dbByPhone.get(normPhone).push(c);
    }
    if (c.name && c.name.trim()) {
      const name = c.name.trim();
      if (!dbByName.has(name)) dbByName.set(name, []);
      dbByName.get(name).push(c);
    }
  });

  console.log("\n=== STEP 2: Reading Excel '正確版總表.xlsx' ===");
  const excelPath = path.resolve('正確版總表.xlsx');
  const workbook = XLSX.readFile(excelPath);

  // We check sheet '客戶資料統整' primarily, but also check other sheets if any contain customer rows
  const sheet = workbook.Sheets['客戶資料統整'];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  console.log(`Total rows in '客戶資料統整': ${rawRows.length}`);

  // Print first 2 rows keys to understand header mapping
  if (rawRows.length > 0) {
    console.log("Keys in '客戶資料統整':", Object.keys(rawRows[0]));
  }

  // Parse Excel customers
  const excelCustomers = [];
  rawRows.forEach((row, idx) => {
    const name = String(row['姓名'] || '').trim();
    const phoneRaw = row['電話'];
    const normPhone = normalizePhone(phoneRaw);
    const id = String(row['編號'] || '').trim();
    const plate = String(row['車牌'] || '').trim();
    const model = String(row['車種'] || '').trim();
    const service = String(row['施工項目'] || '').trim();
    const brand = String(row['品牌'] || '').trim();

    // Check if row has any useful customer info
    if (name || normPhone || id || plate) {
      excelCustomers.push({
        excelRowIndex: idx + 2, // 1-based header is row 1
        id,
        name,
        phone: String(phoneRaw || '').trim(),
        normPhone,
        plateNumber: plate,
        model,
        brand,
        mainService: service,
        rawRow: row
      });
    }
  });

  console.log(`Parsed ${excelCustomers.length} valid customer rows from Excel.`);

  // Specifically check "汪君翰" and "0989912500"
  console.log("\n=== Checking specific target: 汪君翰 / 0989912500 ===");
  const targetName = "汪君翰";
  const targetPhone = "0989912500";

  const dbWang = dbCustomers.filter(c => c.name?.includes(targetName) || normalizePhone(c.phone) === targetPhone);
  console.log("In Supabase DB:", dbWang);

  const excelWang = excelCustomers.filter(c => c.name?.includes(targetName) || c.normPhone === targetPhone);
  console.log("In Excel sheet:", excelWang);

  // Detailed Analysis:
  // 1. Missing in CRM completely (no ID match AND no Phone match AND no Name match)
  // 2. ID collisions with CRM
  // 3. Phone collisions with CRM
  // 4. Name collisions with CRM
  // 5. Internal duplicates within Excel itself (duplicate ID, duplicate Phone, duplicate Name inside Excel)

  const missingFromCrm = [];
  const duplicateIdInCrm = [];
  const duplicatePhoneInCrm = [];
  const duplicateNameInCrm = [];

  excelCustomers.forEach(ec => {
    const hasIdMatch = ec.id && dbById.has(ec.id);
    const hasPhoneMatch = ec.normPhone && dbByPhone.has(ec.normPhone);
    const hasNameMatch = ec.name && dbByName.has(ec.name);

    if (hasIdMatch) {
      duplicateIdInCrm.push({ excel: ec, dbMatches: dbById.get(ec.id) });
    }
    if (hasPhoneMatch) {
      duplicatePhoneInCrm.push({ excel: ec, dbMatches: dbByPhone.get(ec.normPhone) });
    }
    if (hasNameMatch) {
      duplicateNameInCrm.push({ excel: ec, dbMatches: dbByName.get(ec.name) });
    }

    // Complete missing check: Neither Phone nor Name match (and if ID exists, ID doesn't match either)
    if (!hasPhoneMatch && !hasNameMatch && (!ec.id || !hasIdMatch)) {
      missingFromCrm.push(ec);
    }
  });

  console.log("\n=== SUMMARY OF COMPARISON ===");
  console.log(`1. Totally Missing from CRM (No Phone, No Name, No ID match in DB): ${missingFromCrm.length}`);
  console.log(`2. Excel rows matching CRM by ID: ${duplicateIdInCrm.length}`);
  console.log(`3. Excel rows matching CRM by Phone: ${duplicatePhoneInCrm.length}`);
  console.log(`4. Excel rows matching CRM by Name: ${duplicateNameInCrm.length}`);

  // Internal duplicates within Excel
  const excelIdCount = new Map();
  const excelPhoneCount = new Map();
  const excelNameCount = new Map();

  excelCustomers.forEach(ec => {
    if (ec.id) excelIdCount.set(ec.id, (excelIdCount.get(ec.id) || 0) + 1);
    if (ec.normPhone) excelPhoneCount.set(ec.normPhone, (excelPhoneCount.get(ec.normPhone) || 0) + 1);
    if (ec.name) excelNameCount.set(ec.name, (excelNameCount.get(ec.name) || 0) + 1);
  });

  const internalDuplicateIds = Array.from(excelIdCount.entries()).filter(([k, v]) => v > 1);
  const internalDuplicatePhones = Array.from(excelPhoneCount.entries()).filter(([k, v]) => v > 1);
  const internalDuplicateNames = Array.from(excelNameCount.entries()).filter(([k, v]) => v > 1);

  console.log(`5. Internal Excel duplicate IDs: ${internalDuplicateIds.length}`);
  console.log(`6. Internal Excel duplicate Phones: ${internalDuplicatePhones.length}`);
  console.log(`7. Internal Excel duplicate Names: ${internalDuplicateNames.length}`);

}

main().catch(console.error);

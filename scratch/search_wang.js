import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

// Parse .env
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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function main() {
  console.log("=== SEARCHING IN ALL EXCEL FILES ===");
  const files = fs.readdirSync('.').filter(f => f.endsWith('.xlsx'));
  files.forEach(f => {
    console.log(`\nChecking Excel file: ${f}`);
    try {
      const wb = XLSX.readFile(f);
      wb.SheetNames.forEach(sName => {
        const sheet = wb.Sheets[sName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        json.forEach((row, i) => {
          const str = JSON.stringify(row);
          if (str.includes('汪君翰') || str.includes('0989912500')) {
            console.log(`  [Match in ${f} -> ${sName} row ${i + 2}]:`, row);
          }
        });
      });
    } catch (e) {
      console.error(`Error reading ${f}:`, e.message);
    }
  });

  console.log("\n=== SEARCHING IN SUPABASE DB ===");
  const { data: dbAll } = await supabase.from('customers').select('*');
  dbAll.forEach(c => {
    const str = JSON.stringify(c);
    if (str.includes('汪君翰') || str.includes('0989912500')) {
      console.log(`  [Match in DB id=${c.id}]:`, c);
    }
  });
}

main().catch(console.error);

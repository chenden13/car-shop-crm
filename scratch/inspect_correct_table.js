import XLSX from 'xlsx';
import path from 'path';

const excelPath = path.resolve('正確版總表.xlsx');
const workbook = XLSX.readFile(excelPath);

console.log("Sheet names in 正確版總表.xlsx:", workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`\n--- Sheet: ${sheetName} ---`);
  console.log(`Total rows: ${json.length}`);
  if (json.length > 0) {
    console.log("Header row (row 0):", json[0]);
    if (json.length > 1) {
      console.log("Sample row 1:", json[1]);
    }
  }
});

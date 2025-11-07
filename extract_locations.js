const XLSX = require('xlsx');

const workbook = XLSX.readFile('attached_assets/Universities Profile Data (4) (1)_1762475959246.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log('Total rows:', data.length);
console.log('\nFirst 3 rows with location data:');
data.slice(0, 3).forEach((row, idx) => {
  const locationKeys = Object.keys(row).filter(k => 
    k.toLowerCase().includes('city') || 
    k.toLowerCase().includes('state') || 
    k.toLowerCase().includes('location') ||
    k.toLowerCase().includes('addr')
  );
  console.log(`\nRow ${idx + 1} - ${row['INSTNM'] || row['Institution Name'] || 'Unknown'}:`);
  locationKeys.forEach(key => {
    console.log(`  ${key}: ${row[key]}`);
  });
});

console.log('\nAll column names:');
console.log(Object.keys(data[0]).join(', '));

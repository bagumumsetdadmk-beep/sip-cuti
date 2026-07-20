const fs = require('fs');

for (const file of ['components/PengajuanCutiView.tsx', 'components/RekapCutiView.tsx', 'components/UserView.tsx']) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('const itemsPerPage = 10;')) {
    code = code.replace(`  const [currentPage, setCurrentPage] = useState(1);`, `  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;`);
    fs.writeFileSync(file, code);
    console.log("Added itemsPerPage to", file);
  }
}

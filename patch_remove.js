const fs = require('fs');
let code = fs.readFileSync('components/PengajuanCutiView.tsx', 'utf8');

// replace the first instance of currentPage
code = code.replace(`  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;`, ``);

fs.writeFileSync('components/PengajuanCutiView.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('components/PengajuanCutiView.tsx', 'utf8');

code = code.replace(`  const filteredStatus = pengajuan.filter(p =>`, `  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;\n  const filteredStatus = pengajuan.filter(p =>`);
code = code.replace(`  const filteredSearch = filteredRole.filter`, `  const filteredSearchBase = filteredRole.filter`);
code = code.replace(`p.alasan.toLowerCase().includes(searchLower);\n  });`, `p.alasan.toLowerCase().includes(searchLower);\n  );\n  const totalPages = Math.ceil(filteredSearchBase.length / itemsPerPage);\n  const filteredSearch = filteredSearchBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`);

code = code.replace(/filteredSearch\.length/g, `filteredSearchBase.length`);
fs.writeFileSync('components/PengajuanCutiView.tsx', code);

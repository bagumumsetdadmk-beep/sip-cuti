const fs = require('fs');
let code = fs.readFileSync('components/PengajuanCutiView.tsx', 'utf8');

code = code.replace(`  const [searchTerm, setSearchTerm] = useState('');`, 
  `  const [searchTerm, setSearchTerm] = useState('');\n  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;`);
  
code = code.replace(`  const filteredSearch = filteredRole.filter(p =>`, `  const filteredSearchBase = filteredRole.filter(p =>`);
code = code.replace(`p.alasan.toLowerCase().includes(searchLower);\n  });`, `p.alasan.toLowerCase().includes(searchLower);\n  );\n  const totalPages = Math.ceil(filteredSearchBase.length / itemsPerPage);\n  const filteredSearch = filteredSearchBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`);

code = code.replace(/filteredSearch\.length/g, `filteredSearchBase.length`);
// Note: `totalItems={filteredSearchBase.length}` has been automatically applied because I replaced `filteredSearch.length` globally.

fs.writeFileSync('components/PengajuanCutiView.tsx', code);

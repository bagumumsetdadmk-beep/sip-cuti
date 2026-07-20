const fs = require('fs');

// HariLibur
let code = fs.readFileSync('components/HariLiburView.tsx', 'utf8');

if (!code.includes('Pagination from')) {
  code = code.replace(`import { useToast }`, `import Pagination from './Pagination';\nimport { useToast }`);
}

if (!code.includes('currentPage')) {
  code = code.replace(`  const [searchTerm, setSearchTerm] = useState('');`, 
    `  const [searchTerm, setSearchTerm] = useState('');\n  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;`);
}

code = code.replace(`onChange={(e) => setSearchTerm(e.target.value)}`, `onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}`);

if (!code.includes('const paginatedLibur')) {
  code = code.replace(`  const filteredLibur = hariLibur.filter(hl => `,
    `  const filteredLiburBase = hariLibur.filter(hl => `);
  
  code = code.replace(`    hl.jenis.toLowerCase().includes(searchTerm.toLowerCase())\n  );`,
    `    hl.jenis.toLowerCase().includes(searchTerm.toLowerCase())\n  );\n  const totalPages = Math.ceil(filteredLiburBase.length / itemsPerPage);\n  const paginatedLibur = filteredLiburBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`);
}

code = code.replace(`filteredLibur.length === 0`, `filteredLiburBase.length === 0`);
code = code.replace(`totalItems={filteredLibur.length}`, `totalItems={filteredLiburBase.length}`);

fs.writeFileSync('components/HariLiburView.tsx', code);

// JenisCuti
let code2 = fs.readFileSync('components/JenisCutiView.tsx', 'utf8');

if (!code2.includes('Pagination from')) {
  code2 = code2.replace(`import { useToast }`, `import Pagination from './Pagination';\nimport { useToast }`);
}

if (!code2.includes('currentPage')) {
  code2 = code2.replace(`  const [searchTerm, setSearchTerm] = useState('');`, 
    `  const [searchTerm, setSearchTerm] = useState('');\n  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;`);
}

code2 = code2.replace(`onChange={(e) => setSearchTerm(e.target.value)}`, `onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}`);

if (!code2.includes('const paginatedJenis')) {
  code2 = code2.replace(`  const filteredJenis = jenisCuti.filter(j => `,
    `  const filteredJenisBase = jenisCuti.filter(j => `);
  
  code2 = code2.replace(`    j.keterangan?.toLowerCase().includes(searchTerm.toLowerCase())\n  );`,
    `    j.keterangan?.toLowerCase().includes(searchTerm.toLowerCase())\n  );\n  const totalPages = Math.ceil(filteredJenisBase.length / itemsPerPage);\n  const paginatedJenis = filteredJenisBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`);
}

code2 = code2.replace(`filteredJenis.length === 0`, `filteredJenisBase.length === 0`);
code2 = code2.replace(`totalItems={filteredJenis.length}`, `totalItems={filteredJenisBase.length}`);

fs.writeFileSync('components/JenisCutiView.tsx', code2);


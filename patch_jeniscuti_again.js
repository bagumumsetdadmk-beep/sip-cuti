const fs = require('fs');
let code = fs.readFileSync('components/JenisCutiView.tsx', 'utf8');

if (!code.includes('currentPage')) {
  code = code.replace(`  const [searchTerm, setSearchTerm] = useState('');`, 
    `  const [searchTerm, setSearchTerm] = useState('');\n  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;`);
}

code = code.replace(`onChange={(e) => setSearchTerm(e.target.value)}`, `onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}`);

if (!code.includes('const paginatedJenis')) {
  code = code.replace(`  const filteredJC = jenisCuti.filter(jc => `,
    `  const filteredJCBase = jenisCuti.filter(jc => `);
  
  code = code.replace(`    jc.hakPegawai.toLowerCase().includes(searchTerm.toLowerCase())\n  );`,
    `    jc.hakPegawai.toLowerCase().includes(searchTerm.toLowerCase())\n  );\n  const totalPages = Math.ceil(filteredJCBase.length / itemsPerPage);\n  const paginatedJenis = filteredJCBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`);
}

code = code.replace(`filteredJC.length === 0`, `filteredJCBase.length === 0`);
code = code.replace(`filteredJC.map`, `paginatedJenis.map`);
code = code.replace(`totalItems={filteredJenis.length}`, `totalItems={filteredJCBase.length}`);
code = code.replace(`totalItems={filteredJC.length}`, `totalItems={filteredJCBase.length}`);

fs.writeFileSync('components/JenisCutiView.tsx', code);

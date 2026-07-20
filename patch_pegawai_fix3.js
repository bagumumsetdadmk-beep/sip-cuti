const fs = require('fs');
let code = fs.readFileSync('components/PegawaiView.tsx', 'utf8');

code = code.replace(`  const filteredPegawai = pegawai.filter`, `  const filteredPegawaiBase = pegawai.filter`);
code = code.replace(`p.nip.includes(searchTerm)\n  );`, `p.nip.includes(searchTerm)\n  );\n  const totalPages = Math.ceil(filteredPegawaiBase.length / itemsPerPage);\n  const paginatedPegawai = filteredPegawaiBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`);

fs.writeFileSync('components/PegawaiView.tsx', code);

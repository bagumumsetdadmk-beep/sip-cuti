const fs = require('fs');
let code = fs.readFileSync('components/PegawaiView.tsx', 'utf8');

const target = `  const filteredPegawai = pegawai.filter(p => {`;
const replacement = `  const filteredPegawaiBase = pegawai.filter(p => {`;
if (code.includes(target)) {
  code = code.replace(target, replacement);
  code = code.replace(`    return p.nama.toLowerCase().includes(searchLower) || p.nip.includes(searchTerm);\n  });`,
    `    return p.nama.toLowerCase().includes(searchLower) || p.nip.includes(searchTerm);\n  });\n  const totalPages = Math.ceil(filteredPegawaiBase.length / itemsPerPage);\n  const paginatedPegawai = filteredPegawaiBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`);
}

code = code.replace(/filteredPegawai\.length/g, `filteredPegawaiBase.length`);
fs.writeFileSync('components/PegawaiView.tsx', code);

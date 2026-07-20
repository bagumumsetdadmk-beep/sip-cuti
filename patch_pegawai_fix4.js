const fs = require('fs');
let code = fs.readFileSync('components/PegawaiView.tsx', 'utf8');

code = code.replace(`  const filteredPegawaiBase = pegawai.filter`, `  const filteredPegawaiBase_tmp = pegawai.filter`); // Just in case it was renamed
code = code.replace(`  const filteredPegawai = pegawai.filter`, `  const filteredPegawaiBase = pegawai.filter`);

const targetStr = `p.jabatan.toLowerCase().includes(searchTerm.toLowerCase())\n  );`;
const replacementStr = `p.jabatan.toLowerCase().includes(searchTerm.toLowerCase())\n  );\n  const totalPages = Math.ceil(filteredPegawaiBase.length / itemsPerPage);\n  const paginatedPegawai = filteredPegawaiBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  console.log("Success");
} else {
  console.log("Not found");
}

fs.writeFileSync('components/PegawaiView.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('components/PegawaiView.tsx', 'utf8');

const target = `  const filteredPegawai = pegawai.filter(p => 
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.nip.includes(searchTerm)
  );
  const totalPages = Math.ceil(filteredPegawai.length / itemsPerPage);
  const paginatedPegawai = filteredPegawai.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;

const replacement = `  const filteredPegawaiBase = pegawai.filter(p => 
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.nip.includes(searchTerm)
  );
  const totalPages = Math.ceil(filteredPegawaiBase.length / itemsPerPage);
  const paginatedPegawai = filteredPegawaiBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('components/PegawaiView.tsx', code);
  console.log("Replaced successfully");
} else {
  // If my previous script didn't apply exactly as I thought, let's just do a string replace of the map part.
  const mapStr = `  const filteredPegawai = pegawai.filter(p => \n    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || \n    p.nip.includes(searchTerm)\n  );`;
  if (code.includes(mapStr)) {
     const replacement2 = `  const filteredPegawaiBase = pegawai.filter(p => \n    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || \n    p.nip.includes(searchTerm)\n  );\n  const totalPages = Math.ceil(filteredPegawaiBase.length / itemsPerPage);\n  const paginatedPegawai = filteredPegawaiBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;
     code = code.replace(mapStr, replacement2);
     fs.writeFileSync('components/PegawaiView.tsx', code);
     console.log("Replaced using alternative pattern");
  } else {
     console.log("Pattern not found");
  }
}

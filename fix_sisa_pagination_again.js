const fs = require('fs');
let code = fs.readFileSync('components/SisaCutiView.tsx', 'utf8');

const target = `    return p.nama.toLowerCase().includes(s) || p.nip.includes(s) || p.unitKerja.toLowerCase().includes(s);\n  });`;

const replacement = `    return p.nama.toLowerCase().includes(s) || p.nip.includes(s) || p.unitKerja.toLowerCase().includes(s);\n  });\n  const totalPages = Math.ceil(filteredSisaBase.length / itemsPerPage);\n  const filteredSisa = filteredSisaBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;

code = code.replace(target, replacement);

fs.writeFileSync('components/SisaCutiView.tsx', code);

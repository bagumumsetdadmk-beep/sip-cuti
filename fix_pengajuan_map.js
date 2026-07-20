const fs = require('fs');
let code = fs.readFileSync('components/PengajuanCutiView.tsx', 'utf8');

const mapTarget = `  const totalPages = Math.ceil(filteredPengajuanBase.length / itemsPerPage);\n  filteredPengajuanBase = filteredPengajuanBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;

// Wait, I don't know what is actually written for the slice. Let me grep slice.

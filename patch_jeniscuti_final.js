const fs = require('fs');
let code = fs.readFileSync('components/JenisCutiView.tsx', 'utf8');

const target = `  const sortedJenis = [...jenisCuti].sort((a, b) => a.nama.localeCompare(b.nama));`;
const replacement = `  const sortedJenis = [...jenisCuti].sort((a, b) => a.nama.localeCompare(b.nama));
  
  const filteredJenis = sortedJenis.filter(j => {
    return j.nama.toLowerCase().includes(searchTerm?.toLowerCase() || '');
  });
  const totalPages = Math.ceil(filteredJenis.length / itemsPerPage);
  const paginatedJenis = filteredJenis.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;

if (code.includes(target) && !code.includes('filteredJenis.slice')) {
  code = code.replace(target, replacement);
}

fs.writeFileSync('components/JenisCutiView.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('components/PengajuanCutiView.tsx', 'utf8');

code = code.replace(`  const filteredPengajuan = pengajuan.filter`, `  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;\n  const filteredPengajuanBase = pengajuan.filter`);

const target = `    return matchesSearch && matchesStatus;\n  });`;
const replacement = `    return matchesSearch && matchesStatus;\n  });\n  const totalPages = Math.ceil(filteredPengajuanBase.length / itemsPerPage);\n  const filteredPengajuan = filteredPengajuanBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;

code = code.replace(target, replacement);
code = code.replace(/filteredPengajuan\.length/g, `filteredPengajuanBase.length`);
code = code.replace(`filteredPengajuanBase = filteredPengajuanBase.slice`, `filteredPengajuan = filteredPengajuanBase.slice`);

fs.writeFileSync('components/PengajuanCutiView.tsx', code);

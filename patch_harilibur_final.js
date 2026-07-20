const fs = require('fs');
let code = fs.readFileSync('components/HariLiburView.tsx', 'utf8');

const target = `  const sortedLibur = [...hariLibur].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());`;
const replacement = `  const sortedLibur = [...hariLibur].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  
  const filteredLibur = sortedLibur.filter(l => {
    return l.keterangan.toLowerCase().includes(searchTerm?.toLowerCase() || '');
  });
  const totalPages = Math.ceil(filteredLibur.length / itemsPerPage);
  const paginatedLibur = filteredLibur.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
}

const stateTarget = `  const [itemToDelete, setItemToDelete] = useState<string | null>(null);`;
if (!code.includes('const [currentPage')) {
  code = code.replace(stateTarget, `  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;`);
}

fs.writeFileSync('components/HariLiburView.tsx', code);

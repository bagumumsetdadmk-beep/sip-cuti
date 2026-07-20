const fs = require('fs');
let code = fs.readFileSync('components/HariLiburView.tsx', 'utf8');

// 2. Add currentPage state
if (!code.includes('const [currentPage, setCurrentPage] = useState(1);')) {
  const target = `  const [itemToDelete, setItemToDelete] = useState<string | null>(null);`;
  const replacement = `  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;`;
  code = code.replace(target, replacement);
}

// 3. Update map
if (!code.includes('paginatedLibur.map')) {
  code = code.replace(`filteredLibur.map((hl, idx) => (`, `paginatedLibur.map((hl, idx) => (`);
}

fs.writeFileSync('components/HariLiburView.tsx', code);

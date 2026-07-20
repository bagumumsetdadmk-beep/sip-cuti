const fs = require('fs');

const filesToFix = [
  'components/PengajuanCutiView.tsx',
  'components/RekapCutiView.tsx',
  'components/UserView.tsx'
];

for (const file of filesToFix) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('const [currentPage, setCurrentPage]')) {
    // try to find where to put it
    if (file === 'components/PengajuanCutiView.tsx') {
      code = code.replace(`  const [statusFilter, setStatusFilter] = useState<string>('semua');`,
        `  const [statusFilter, setStatusFilter] = useState<string>('semua');\n  const [searchTerm, setSearchTerm] = useState('');\n  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;`);
    } else if (file === 'components/RekapCutiView.tsx') {
      code = code.replace(`  const [tahunFilter, setTahunFilter] = useState<number>(new Date().getFullYear());`,
        `  const [tahunFilter, setTahunFilter] = useState<number>(new Date().getFullYear());\n  const [searchTerm, setSearchTerm] = useState('');\n  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;`);
    } else if (file === 'components/UserView.tsx') {
      code = code.replace(`  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);\n  const [itemToDelete, setItemToDelete] = useState<string | null>(null);`,
        `  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);\n  const [itemToDelete, setItemToDelete] = useState<string | null>(null);\n  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;`);
    }
    fs.writeFileSync(file, code);
    console.log("Fixed currentPage on", file);
  }
}

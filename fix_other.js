const fs = require('fs');

// UserView.tsx
let code = fs.readFileSync('components/UserView.tsx', 'utf8');
if (!code.includes('currentPage')) {
  code = code.replace(`  const [searchTerm, setSearchTerm] = useState('');`, 
    `  const [searchTerm, setSearchTerm] = useState('');\n  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;`);
}
code = code.replace(`  const filteredUsers = users.filter`, `  const filteredUsersBase = users.filter`);
code = code.replace(`u.role.toLowerCase().includes(searchTerm.toLowerCase())\n  );`, 
  `u.role.toLowerCase().includes(searchTerm.toLowerCase())\n  );\n  const totalPages = Math.ceil(filteredUsersBase.length / itemsPerPage);\n  const filteredUsers = filteredUsersBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`);
code = code.replace(/filteredUsers\.length/g, `filteredUsersBase.length`);
fs.writeFileSync('components/UserView.tsx', code);

// RekapCutiView.tsx
let code2 = fs.readFileSync('components/RekapCutiView.tsx', 'utf8');
if (!code2.includes('currentPage')) {
  code2 = code2.replace(`  const [searchTerm, setSearchTerm] = useState('');`, 
    `  const [searchTerm, setSearchTerm] = useState('');\n  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;`);
}
code2 = code2.replace(`  const filteredLaporan = laporan.filter`, `  const filteredLaporanBase = laporan.filter`);
code2 = code2.replace(`p.nip.includes(searchTerm)\n  );`, 
  `p.nip.includes(searchTerm)\n  );\n  const totalPages = Math.ceil(filteredLaporanBase.length / itemsPerPage);\n  const filteredLaporan = filteredLaporanBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`);
code2 = code2.replace(/filteredLaporan\.length/g, `filteredLaporanBase.length`);
fs.writeFileSync('components/RekapCutiView.tsx', code2);

const fs = require('fs');
let code = fs.readFileSync('components/AtasanPejabatView.tsx', 'utf8');

// We need to properly inject Pagination and fix the currentPage reference

// 1. Ensure Pagination is imported
if (!code.includes('import Pagination from')) {
  code = code.replace(`import { Search, UserCheck, Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';`, 
    `import { Search, UserCheck, Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';\nimport Pagination from './Pagination';`);
}

// 2. Add currentPage state
if (!code.includes('const [currentPage, setCurrentPage] = useState(1);')) {
  code = code.replace(`  const [searchTerm, setSearchTerm] = useState('');`, 
    `  const [searchTerm, setSearchTerm] = useState('');\n  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;`);
}

// 3. Fix the mapping variable mismatch
// It currently maps filteredAP, but my script created filteredAtasan
const apMatch = `  const filteredAP = atasanPejabat.filter(ap => {`;
const newApMatch = `  const filteredAP_base = atasanPejabat.filter(ap => {`;
if (code.includes(apMatch)) {
  code = code.replace(apMatch, newApMatch);
  
  const endFilter = `  });`;
  const newEndFilter = `  });
  const totalPages = Math.ceil(filteredAP_base.length / itemsPerPage);
  const filteredAP = filteredAP_base.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;
  code = code.replace(endFilter, newEndFilter);
}

// 4. Update the input onChange for pagination
const searchMatch = `              onChange={(e) => setSearchTerm(e.target.value)}`;
const newSearchMatch = `              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}`;
if (code.includes(searchMatch)) {
  code = code.replace(searchMatch, newSearchMatch);
}

// 5. Add Pagination Component at the end of the table
const tableEnd = `          </table>
        </div>
      </div>`;
const newTableEnd = `          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={typeof totalPages !== 'undefined' ? totalPages : 1}
          onPageChange={setCurrentPage}
          totalItems={typeof filteredAP_base !== 'undefined' ? filteredAP_base.length : 0}
          itemsPerPage={itemsPerPage}
        />
      </div>`;
if (code.includes(tableEnd)) {
  code = code.replace(tableEnd, newTableEnd);
}

fs.writeFileSync('components/AtasanPejabatView.tsx', code);
console.log('Success patch_atasan_fix.js');

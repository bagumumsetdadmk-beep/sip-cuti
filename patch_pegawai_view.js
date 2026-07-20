const fs = require('fs');
let code = fs.readFileSync('components/PegawaiView.tsx', 'utf8');

// 1. Add Import
const importMatch = `import { Search, UserPlus, Edit2, Trash2, X, Download } from 'lucide-react';`;
const newImport = `import { Search, UserPlus, Edit2, Trash2, X, Download } from 'lucide-react';
import Pagination from './Pagination';`;
if (code.includes(importMatch)) code = code.replace(importMatch, newImport);

// 2. Add State
const stateMatch = `  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);`;
const newStateMatch = `  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;`;
if (code.includes(stateMatch)) code = code.replace(stateMatch, newStateMatch);

// 3. Search change to reset page
const searchMatch = `              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}`;
const newSearchMatch = `              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}`;
if (code.includes(searchMatch)) code = code.replace(searchMatch, newSearchMatch);

// 4. Update filtering logic to include pagination
const filterMatch = `  const filteredPegawai = pegawai.filter(p => 
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.nip.includes(searchTerm)
  );`;
const newFilterMatch = `  const filteredPegawai = pegawai.filter(p => 
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.nip.includes(searchTerm)
  );
  const totalPages = Math.ceil(filteredPegawai.length / itemsPerPage);
  const paginatedPegawai = filteredPegawai.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;
if (code.includes(filterMatch)) code = code.replace(filterMatch, newFilterMatch);

// 5. Update map to use paginated
const mapMatch = `              ) : (
                filteredPegawai.map((p, idx) => (`;
const newMapMatch = `              ) : (
                paginatedPegawai.map((p, idx) => (`;
if (code.includes(mapMatch)) code = code.replace(mapMatch, newMapMatch);

// 6. Update idx
const idxMatch = `<td className="p-4 font-mono text-gray-400">{idx + 1}</td>`;
const newIdxMatch = `<td className="p-4 font-mono text-gray-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>`;
if (code.includes(idxMatch)) code = code.replace(idxMatch, newIdxMatch);

// 7. Add Pagination component
const tableMatch = `          </table>
        </div>
      </div>`;
const newTableMatch = `          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredPegawai.length}
          itemsPerPage={itemsPerPage}
        />
      </div>`;
if (code.includes(tableMatch)) code = code.replace(tableMatch, newTableMatch);

fs.writeFileSync('components/PegawaiView.tsx', code);
console.log('Success patch_pegawai_view.js');

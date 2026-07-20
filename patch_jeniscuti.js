const fs = require('fs');
let code = fs.readFileSync('components/JenisCutiView.tsx', 'utf8');

const importMatch = `import { List, Plus, Edit2, Trash2, X } from 'lucide-react';`;
const newImport = `import { List, Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import Pagination from './Pagination';`;
if (code.includes(importMatch)) code = code.replace(importMatch, newImport);

const stateMatch = `  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);`;
const newStateMatch = `  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;`;
if (code.includes(stateMatch)) code = code.replace(stateMatch, newStateMatch);

const filterMatch = `  const sortedJenis = [...jenisCuti].sort((a, b) => a.nama.localeCompare(b.nama));`;
const newFilterMatch = `  const sortedJenis = [...jenisCuti].sort((a, b) => a.nama.localeCompare(b.nama));
  
  const filteredJenis = sortedJenis.filter(j => j.nama.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredJenis.length / itemsPerPage);
  const paginatedJenis = filteredJenis.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;
if (code.includes(filterMatch)) code = code.replace(filterMatch, newFilterMatch);

const searchHtmlMatch = `          <button
            onClick={() => {`;
const newSearchHtmlMatch = `          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari jenis cuti..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button
            onClick={() => {`;
if (code.includes(searchHtmlMatch)) code = code.replace(searchHtmlMatch, newSearchHtmlMatch);


const mapMatch = `              {sortedJenis.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 text-sm">
                    Belum ada data jenis cuti.
                  </td>
                </tr>
              ) : (
                sortedJenis.map((j, idx) => (`;
const newMapMatch = `              {filteredJenis.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 text-sm">
                    Belum ada data jenis cuti.
                  </td>
                </tr>
              ) : (
                paginatedJenis.map((j, idx) => (`;
if (code.includes(mapMatch)) code = code.replace(mapMatch, newMapMatch);

const idxMatch = `<td className="p-4 font-mono text-gray-400">{idx + 1}</td>`;
const newIdxMatch = `<td className="p-4 font-mono text-gray-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>`;
if (code.includes(idxMatch)) code = code.replace(idxMatch, newIdxMatch);


const tableMatch = `          </table>
        </div>
      </div>`;
const newTableMatch = `          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredJenis.length}
          itemsPerPage={itemsPerPage}
        />
      </div>`;
if (code.includes(tableMatch)) code = code.replace(tableMatch, newTableMatch);

fs.writeFileSync('components/JenisCutiView.tsx', code);
console.log('Success patch_jeniscuti.js');

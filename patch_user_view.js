const fs = require('fs');
let code = fs.readFileSync('components/UserView.tsx', 'utf8');

const importMatch = `import { Users, Plus, Edit2, Trash2, X, Search } from 'lucide-react';`;
const newImport = `import { Users, Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import Pagination from './Pagination';`;
if (code.includes(importMatch)) code = code.replace(importMatch, newImport);

const stateMatch = `  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);`;
const newStateMatch = `  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;`;
if (code.includes(stateMatch)) code = code.replace(stateMatch, newStateMatch);

const searchHtmlMatch = `              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}`;
const newSearchHtmlMatch = `              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}`;
if (code.includes(searchHtmlMatch)) code = code.replace(searchHtmlMatch, newSearchHtmlMatch);

const filterMatch = `  const filteredUsers = sortedUsers.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    return u.nama.toLowerCase().includes(searchLower) || u.username.toLowerCase().includes(searchLower);
  });`;
const newFilterMatch = `  const filteredUsers = sortedUsers.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    return u.nama.toLowerCase().includes(searchLower) || u.username.toLowerCase().includes(searchLower);
  });
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;
if (code.includes(filterMatch)) code = code.replace(filterMatch, newFilterMatch);


const mapMatch = `              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">
                    Belum ada data user.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => (`;
const newMapMatch = `              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">
                    Belum ada data user.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u, idx) => (`;
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
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
        />
      </div>`;
if (code.includes(tableMatch)) code = code.replace(tableMatch, newTableMatch);

fs.writeFileSync('components/UserView.tsx', code);
console.log('Success patch_user_view.js');

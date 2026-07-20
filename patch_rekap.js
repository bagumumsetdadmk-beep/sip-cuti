const fs = require('fs');
let code = fs.readFileSync('components/RekapCutiView.tsx', 'utf8');

const importMatch = `import { FileBarChart, Download, Search } from 'lucide-react';`;
const newImport = `import { FileBarChart, Download, Search } from 'lucide-react';
import Pagination from './Pagination';`;
if (code.includes(importMatch)) code = code.replace(importMatch, newImport);

const stateMatch = `  const [tahunFilter, setTahunFilter] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');`;
const newStateMatch = `  const [tahunFilter, setTahunFilter] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;`;
if (code.includes(stateMatch)) code = code.replace(stateMatch, newStateMatch);

const searchHtmlMatch = `              onChange={(e) => setSearchTerm(e.target.value)}`;
const newSearchHtmlMatch = `              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}`;
if (code.includes(searchHtmlMatch)) code = code.replace(searchHtmlMatch, newSearchHtmlMatch);

const filterMatch = `  const filteredRekap = rekapData.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    return r.nama.toLowerCase().includes(searchLower) || r.nip.includes(searchTerm);
  });`;
const newFilterMatch = `  const filteredRekap = rekapData.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    return r.nama.toLowerCase().includes(searchLower) || r.nip.includes(searchTerm);
  });
  const totalPages = Math.ceil(filteredRekap.length / itemsPerPage);
  const paginatedRekap = filteredRekap.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;
if (code.includes(filterMatch)) code = code.replace(filterMatch, newFilterMatch);

const mapMatch = `              {filteredRekap.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 text-sm">
                    Belum ada data rekapitulasi.
                  </td>
                </tr>
              ) : (
                filteredRekap.map((r, idx) => (`;
const newMapMatch = `              {filteredRekap.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 text-sm">
                    Belum ada data rekapitulasi.
                  </td>
                </tr>
              ) : (
                paginatedRekap.map((r, idx) => (`;
if (code.includes(mapMatch)) code = code.replace(mapMatch, newMapMatch);

const idxMatch = `<td className="p-4 font-mono text-gray-400">{idx + 1}</td>`;
const newIdxMatch = `<td className="p-4 font-mono text-gray-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>`;
if (code.includes(idxMatch)) code = code.replace(idxMatch, newIdxMatch);


const tableMatch = `          </table>
        </div>
      </div>
    </div>`;
const newTableMatch = `          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredRekap.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>`;
if (code.includes(tableMatch)) code = code.replace(tableMatch, newTableMatch);

fs.writeFileSync('components/RekapCutiView.tsx', code);
console.log('Success patch_rekap.js');

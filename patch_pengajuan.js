const fs = require('fs');
let code = fs.readFileSync('components/PengajuanCutiView.tsx', 'utf8');

const importMatch = `import { FileText, Plus, CheckCircle, XCircle, Clock, Trash2, X, Download } from 'lucide-react';`;
const newImport = `import { FileText, Plus, CheckCircle, XCircle, Clock, Trash2, X, Download, Search } from 'lucide-react';
import Pagination from './Pagination';`;
if (code.includes(importMatch)) code = code.replace(importMatch, newImport);

const stateMatch = `  const [statusFilter, setStatusFilter] = useState<string>('semua');
  
  const [showDetailModal, setShowDetailModal] = useState(false);`;
const newStateMatch = `  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [showDetailModal, setShowDetailModal] = useState(false);`;
if (code.includes(stateMatch)) code = code.replace(stateMatch, newStateMatch);

const filterMatch = `  const sortedPengajuan = [...filteredByRole].sort((a, b) => new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime());`;
const newFilterMatch = `  const sortedPengajuan = [...filteredByRole].sort((a, b) => new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime());
  
  const filteredSearch = sortedPengajuan.filter(p => {
    const peg = getPegawaiDetail(p.pegawaiId);
    const searchLower = searchTerm.toLowerCase();
    return (peg && peg.nama.toLowerCase().includes(searchLower)) || p.nomorSurat.toLowerCase().includes(searchLower);
  });
  
  const totalPages = Math.ceil(filteredSearch.length / itemsPerPage);
  const paginatedPengajuan = filteredSearch.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;
if (code.includes(filterMatch)) code = code.replace(filterMatch, newFilterMatch);

const headerHtmlMatch = `        <div className="flex gap-2">
          <select
            value={statusFilter}`;
const newHeaderHtmlMatch = `        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari nama/nomor surat..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>
          <select
            value={statusFilter}`;
if (code.includes(headerHtmlMatch)) code = code.replace(headerHtmlMatch, newHeaderHtmlMatch);

const mapMatch = `              {sortedPengajuan.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 text-sm">
                    Belum ada data pengajuan cuti.
                  </td>
                </tr>
              ) : (
                sortedPengajuan.map((p) => {`;
const newMapMatch = `              {filteredSearch.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 text-sm">
                    Belum ada data pengajuan cuti.
                  </td>
                </tr>
              ) : (
                paginatedPengajuan.map((p) => {`;
if (code.includes(mapMatch)) code = code.replace(mapMatch, newMapMatch);

const tableMatch = `          </table>
        </div>
      </div>`;
const newTableMatch = `          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredSearch.length}
          itemsPerPage={itemsPerPage}
        />
      </div>`;
if (code.includes(tableMatch)) code = code.replace(tableMatch, newTableMatch);


fs.writeFileSync('components/PengajuanCutiView.tsx', code);
console.log('Success patch_pengajuan.js');

const fs = require('fs');
let code = fs.readFileSync('components/SisaCutiView.tsx', 'utf8');

const oldProps = `  addSisaCuti: (sc: Omit<SisaCutiTahunan, 'id'>) => Promise<void>;
  updateSisaCuti: (id: string, sc: Partial<SisaCutiTahunan>) => void;
  generateSisaCutiNextYear: () => Promise<void>;
  hitungTotalCutiTahunan: (sc: SisaCutiTahunan) => number;
  currentUser?: PengaturanUser | null;
}

export default function SisaCutiView({ sisaCuti, pegawai, addSisaCuti, updateSisaCuti, generateSisaCutiNextYear, hitungTotalCutiTahunan, currentUser }: SisaCutiViewProps) {`;

const newProps = `  addSisaCuti: (sc: Omit<SisaCutiTahunan, 'id'>) => Promise<void>;
  updateSisaCuti: (id: string, sc: Partial<SisaCutiTahunan>) => void;
  deleteSisaCuti: (id: string) => Promise<void>;
  generateSisaCutiNextYear: () => Promise<void>;
  hitungTotalCutiTahunan: (sc: SisaCutiTahunan) => number;
  currentUser?: PengaturanUser | null;
}

export default function SisaCutiView({ sisaCuti, pegawai, addSisaCuti, updateSisaCuti, deleteSisaCuti, generateSisaCutiNextYear, hitungTotalCutiTahunan, currentUser }: SisaCutiViewProps) {`;

if (code.includes(oldProps)) {
  code = code.replace(oldProps, newProps);
}

// Add Pagination import
const importMatch = `import { Search, Edit2, X, Download, History, Plus } from 'lucide-react';`;
const newImport = `import { Search, Edit2, X, Download, History, Plus, Trash2 } from 'lucide-react';
import Pagination from './Pagination';`;
if (code.includes(importMatch)) {
  code = code.replace(importMatch, newImport);
}

// Add state for delete confirmation and pagination
const stateMatch = `  const [addPegawaiId, setAddPegawaiId] = useState<string>('');
  const [addTahunN, setAddTahunN] = useState<number>(new Date().getFullYear());`;
const newStateMatch = `  const [addPegawaiId, setAddPegawaiId] = useState<string>('');
  const [addTahunN, setAddTahunN] = useState<number>(new Date().getFullYear());
  
  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;`;

if (code.includes(stateMatch)) {
  code = code.replace(stateMatch, newStateMatch);
}

// Update filteredSisa logic
const filterMatch = `  const filteredSisa = sisaCuti.filter(sc => {
    const p = getPegawaiDetail(sc.pegawaiId);
    if (!p) return false;
    const searchLower = searchTerm.toLowerCase();
    return p.nama.toLowerCase().includes(searchLower) || p.nip.toLowerCase().includes(searchLower);
  });`;

const newFilterMatch = `  const filteredSisa = sisaCuti.filter(sc => {
    const p = getPegawaiDetail(sc.pegawaiId);
    if (!p) return false;
    const searchLower = searchTerm.toLowerCase();
    return p.nama.toLowerCase().includes(searchLower) || p.nip.toLowerCase().includes(searchLower);
  });
  
  const totalPages = Math.ceil(filteredSisa.length / itemsPerPage);
  const paginatedSisa = filteredSisa.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;

if (code.includes(filterMatch)) {
  code = code.replace(filterMatch, newFilterMatch);
}

// Change rendering map to use paginatedSisa
const mapMatch = `              {filteredSisa.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 text-sm">
                    Belum ada data sisa cuti.
                  </td>
                </tr>
              ) : (
                filteredSisa.map((sc, idx) => {`;
const newMapMatch = `              {filteredSisa.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 text-sm">
                    Belum ada data sisa cuti.
                  </td>
                </tr>
              ) : (
                paginatedSisa.map((sc, idx) => {`;
if (code.includes(mapMatch)) {
  code = code.replace(mapMatch, newMapMatch);
}

// Add index correct for pagination
const tdMatch = `<td className="p-4 font-mono text-gray-400">{idx + 1}</td>`;
const newTdMatch = `<td className="p-4 font-mono text-gray-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>`;
if (code.includes(tdMatch)) {
  code = code.replace(tdMatch, newTdMatch);
}

// Add Delete Button
const actionMatch = `                            <button
                              id={\`btn-edit-sisa-\${sc.id}\`}
                              onClick={() => openEditModal(sc)}
                              className="p-1.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 rounded transition-all cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                              title="Sesuaikan Saldo"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Sesuaikan</span>
                            </button>
                          )}`;
const newActionMatch = `                            <>
                              <button
                                id={\`btn-edit-sisa-\${sc.id}\`}
                                onClick={() => openEditModal(sc)}
                                className="p-1.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 rounded transition-all cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                                title="Sesuaikan Saldo"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Sesuaikan</span>
                              </button>
                              <button
                                onClick={() => {
                                  setItemToDelete(sc.id);
                                  setShowDeleteConfirm(true);
                                }}
                                className="p-1.5 bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 border border-gray-200 rounded transition-all cursor-pointer ml-1"
                                title="Hapus Saldo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}`;
if (code.includes(actionMatch)) {
  code = code.replace(actionMatch, newActionMatch);
}

// Add pagination component and delete modal
const tableEndMatch = `          </table>
        </div>
      </div>`;
const newTableEndMatch = `          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredSisa.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Saldo Cuti?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Tindakan ini tidak dapat dibatalkan. Saldo akan dihapus dari sistem.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    if (itemToDelete) {
                      await deleteSisaCuti(itemToDelete);
                      showToast('Saldo cuti berhasil dihapus', 'success');
                    }
                    setShowDeleteConfirm(false);
                    setItemToDelete(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg transition-all"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}`;
if (code.includes(tableEndMatch)) {
  code = code.replace(tableEndMatch, newTableEndMatch);
}

// Fix search triggering pagination reset
const searchInputMatch = `          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau NIP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}`;
const newSearchInputMatch = `          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau NIP..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}`;
if (code.includes(searchInputMatch)) {
  code = code.replace(searchInputMatch, newSearchInputMatch);
}

fs.writeFileSync('components/SisaCutiView.tsx', code);
console.log('Success patch_sisa_view5.js');

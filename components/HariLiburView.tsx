'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Search, CalendarDays, Plus, Edit2, Trash2, X, AlertTriangle, Download, Upload } from 'lucide-react';
import { HariLibur, PengaturanUser } from '../lib/types';
import Pagination from './Pagination';
import { useToast } from '../lib/ToastContext';

interface HariLiburViewProps {
  hariLibur: HariLibur[];
  addHariLibur: (hl: Omit<HariLibur, 'id'>) => Promise<void>;
  updateHariLibur: (id: string, hl: Partial<HariLibur>) => Promise<void>;
  deleteHariLibur: (id: string) => Promise<void>;
  currentUser?: PengaturanUser | null;
}

export default function HariLiburView({ hariLibur, addHariLibur, updateHariLibur, deleteHariLibur, currentUser }: HariLiburViewProps) {
  const { showToast } = useToast();
  const isAdmin = currentUser?.role === 'Admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedLibur, setSelectedLibur] = useState<HariLibur | null>(null);

  // Form States
  const [tanggal, setTanggal] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [jenis, setJenis] = useState<'Libur Nasional' | 'Cuti Bersama'>('Libur Nasional');

  const filteredLiburBase = hariLibur.filter(hl => 
    hl.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hl.tanggal.includes(searchTerm) ||
    hl.jenis.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredLiburBase.length / itemsPerPage);
  const paginatedLibur = filteredLiburBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openAddModal = () => {
    setSelectedLibur(null);
    setTanggal('2026-01-01');
    setKeterangan('');
    setJenis('Libur Nasional');
    setShowModal(true);
  };

  const openEditModal = (hl: HariLibur) => {
    setSelectedLibur(hl);
    setTanggal(hl.tanggal);
    setKeterangan(hl.keterangan);
    setJenis(hl.jenis);
    setShowModal(true);
  };

  const openDeleteConfirm = (hl: HariLibur) => {
    setSelectedLibur(hl);
    setShowDeleteConfirm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !keterangan) {
      showToast('Harap isi semua kolom wajib!', 'error');
      return;
    }

    if (selectedLibur) {
      updateHariLibur(selectedLibur.id, { tanggal, keterangan, jenis });
      showToast('Hari libur berhasil diperbarui.', 'success');
    } else {
      addHariLibur({ tanggal, keterangan, jenis });
      showToast('Hari libur baru berhasil ditambahkan.', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (selectedLibur) {
      deleteHariLibur(selectedLibur.id);
      showToast('Hari libur berhasil dihapus.', 'info');
      setShowDeleteConfirm(false);
      setSelectedLibur(null);
    }
  };

  // Helper formatting indonesian date
  const formatIndoDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleExportTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 'Tanggal': '2026-01-01', 'Keterangan': 'Tahun Baru Masehi 2026', 'Jenis': 'Libur Nasional' },
      { 'Tanggal': '2026-03-30', 'Keterangan': 'Cuti Bersama Hari Raya Nyepi', 'Jenis': 'Cuti Bersama' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Hari_Libur");
    XLSX.writeFile(wb, "Template_Hari_Libur.xlsx");
    showToast('Template Hari Libur berhasil diunduh.', 'success');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const ab = evt.target?.result;
          const wb = XLSX.read(ab, { type: 'array' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          let successCount = 0;
          for (const row of data as any[]) {
            const rawTanggal = row['Tanggal'];
            const rawKeterangan = row['Keterangan'];
            const rawJenis = row['Jenis'];
            
            if (rawTanggal && rawKeterangan) {
              let formattedDate = String(rawTanggal).trim();
              if (!isNaN(Number(formattedDate)) && Number(formattedDate) > 30000) {
                const excelDate = new Date((Number(formattedDate) - 25569) * 86400 * 1000);
                formattedDate = excelDate.toISOString().split('T')[0];
              }

              const jenisVal = String(rawJenis).trim().toLowerCase() === 'cuti bersama' ? 'Cuti Bersama' : 'Libur Nasional';
              
              await addHariLibur({
                tanggal: formattedDate,
                keterangan: String(rawKeterangan).trim(),
                jenis: jenisVal
              });
              successCount++;
            }
          }
          showToast(`Berhasil mengimpor ${successCount} data hari libur dari Excel.`, 'success');
        } catch (err: any) {
          console.error(err);
          showToast(`Gagal membaca file Excel: ${err.message || err}`, 'error');
        }
      };
      reader.readAsArrayBuffer(file);
      e.target.value = ''; // reset
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">Hari Libur & Cuti Bersama 2026</h3>
          <p className="text-xs text-gray-500">Kelola master data hari libur nasional serta cuti bersama yang tidak dihitung sebagai hari kerja pengajuan cuti.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <button
                id="btn-export-template-libur"
                onClick={handleExportTemplate}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-gray-500" />
                <span>Unduh Template</span>
              </button>

              <label className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer">
                <Upload className="w-4 h-4 text-gray-500" />
                <span>Import Excel</span>
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportData} />
              </label>

              <button
                id="btn-tambah-libur"
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Hari Libur</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search & Stats */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari keterangan, tanggal, atau jenis..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
          <span>Jumlah Hari Libur: <strong className="text-gray-800">{filteredLiburBase.length}</strong></span>
          <span className="text-gray-300">|</span>
          <span>Libur Nasional: <strong className="text-gray-800">{hariLibur.filter(h => h.jenis === 'Libur Nasional').length}</strong></span>
          <span className="text-gray-300">|</span>
          <span>Cuti Bersama: <strong className="text-gray-800">{hariLibur.filter(h => h.jenis === 'Cuti Bersama').length}</strong></span>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                <th className="p-4">No</th>
                <th className="p-4">Tanggal Libur</th>
                <th className="p-4">Keterangan / Nama Hari Libur</th>
                <th className="p-4">Jenis Libur</th>
                {isAdmin && <th className="p-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredLiburBase.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="p-8 text-center text-gray-400">
                    Data hari libur tidak ditemukan atau kosong.
                  </td>
                </tr>
              ) : (
                paginatedLibur.map((hl, idx) => (
                  <tr key={hl.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="p-4 font-mono text-gray-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-950 font-mono">{hl.tanggal}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{formatIndoDate(hl.tanggal)}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-800">{hl.keterangan}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hl.jenis === 'Libur Nasional' 
                          ? 'bg-rose-50 text-rose-800 border border-rose-100' 
                          : 'bg-amber-50 text-amber-800 border border-amber-100'
                      }`}>
                        {hl.jenis}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`btn-edit-libur-${hl.id}`}
                            onClick={() => openEditModal(hl)}
                            className="p-1.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 rounded transition-all cursor-pointer"
                            title="Ubah Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-libur-${hl.id}`}
                            onClick={() => openDeleteConfirm(hl)}
                            className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-700 border border-gray-200 rounded transition-all cursor-pointer"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredLiburBase.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* MODAL ADD / EDIT */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-850">
                {selectedLibur ? 'Ubah Hari Libur' : 'Tambah Hari Libur'}
              </h4>
              <button 
                id="close-modal-libur"
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Tanggal Libur *</label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Jenis Hari Libur *</label>
                <select
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value as 'Libur Nasional' | 'Cuti Bersama')}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                >
                  <option value="Libur Nasional">Libur Nasional (Tanggal Merah)</option>
                  <option value="Cuti Bersama">Cuti Bersama Pemerintah</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Keterangan *</label>
                <textarea
                  required
                  rows={3}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Hari Raya Idul Fitri 1447 Hijriah"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  id="btn-batal-libur"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-simpan-libur"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100 mx-auto">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-900">Konfirmasi Hapus Hari Libur</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus hari libur <strong className="text-gray-800">{selectedLibur?.keterangan}</strong> pada tanggal {selectedLibur?.tanggal}?
                </p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                id="btn-batal-delete-libur"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-ya-delete-libur"
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

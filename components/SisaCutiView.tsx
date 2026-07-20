'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Trash2, AlertTriangle, Search, Edit2, X, History, Info, Download, Upload } from 'lucide-react';
import { SisaCutiTahunan, Pegawai, PengaturanUser } from '../lib/types';
import { useToast } from '../lib/ToastContext';
import Pagination from './Pagination';

interface SisaCutiViewProps {
  sisaCuti: SisaCutiTahunan[];
  pegawai: Pegawai[];
  addSisaCuti: (sc: Omit<SisaCutiTahunan, 'id'>) => Promise<void>;
  updateSisaCuti: (id: string, sc: Partial<SisaCutiTahunan>) => Promise<void>;
  deleteSisaCuti: (id: string) => Promise<void>;
  generateSisaCutiNextYear: () => Promise<void>;
  hitungTotalCutiTahunan: (sc: SisaCutiTahunan) => number;
  currentUser?: PengaturanUser | null;
}

export default function SisaCutiView({ sisaCuti, pegawai, addSisaCuti, updateSisaCuti, deleteSisaCuti, generateSisaCutiNextYear, hitungTotalCutiTahunan, currentUser }: SisaCutiViewProps) {
  const { showToast } = useToast();
  const isAdmin = currentUser?.role === 'Admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSisa, setSelectedSisa] = useState<SisaCutiTahunan | null>(null);

  // Form States
  const [sisaN2, setSisaN2] = useState<number>(0);
  const [sisaN1, setSisaN1] = useState<number>(0);
  const [sisaN, setSisaN] = useState<number>(12);
  const [addPegawaiId, setAddPegawaiId] = useState<string>('');
  const [addTahunN, setAddTahunN] = useState<number>(new Date().getFullYear());
  
  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getPegawaiDetail = (pegawaiId: string) => {
    return pegawai.find(p => p.id === pegawaiId);
  };

  const filteredSisaBase = sisaCuti.filter(sc => {
    const p = getPegawaiDetail(sc.pegawaiId);
    if (!p) return false;
    const s = searchTerm.toLowerCase();
    return p.nama.toLowerCase().includes(s) || p.nip.includes(s) || p.unitKerja.toLowerCase().includes(s);
  });
  const totalPages = Math.ceil(filteredSisaBase.length / itemsPerPage);
  const filteredSisa = filteredSisaBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openEditModal = (sc: SisaCutiTahunan) => {
    setSelectedSisa(sc);
    setSisaN2(sc.sisaN2);
    setSisaN1(sc.sisaN1);
    setSisaN(sc.sisaN);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSisa) {
      updateSisaCuti(selectedSisa.id, {
        sisaN2: Number(sisaN2),
        sisaN1: Number(sisaN1),
        sisaN: Number(sisaN)
      });
      showToast('Saldo cuti berhasil disesuaikan.', 'success');
      setShowModal(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addPegawaiId) {
      showToast('Pilih pegawai terlebih dahulu', 'error');
      return;
    }
    await addSisaCuti({
      pegawaiId: addPegawaiId,
      sisaN2: Number(sisaN2),
      sisaN1: Number(sisaN1),
      sisaN: Number(sisaN),
      tahunN: addTahunN
    });
    showToast('Saldo cuti berhasil ditambahkan.', 'success');
    setShowAddModal(false);
  };

  const handleExportTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { NIP: '198501012010011001', Nama: 'John Doe', 'Sisa N-2': 0, 'Sisa N-1': 0, 'Sisa N': 12 }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Sisa_Cuti");
    XLSX.writeFile(wb, "template_sisa_cuti.xlsx");
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
          
          let insertCount = 0;
          let updateCount = 0;
          const currentYear = new Date().getFullYear();

          for (const row of data as any[]) {
            if (row.NIP) {
              const nipStr = String(row.NIP).trim().replace(/\s/g, '');
              // Find pegawai by NIP
              const pg = pegawai.find(p => p.nip.trim().replace(/\s/g, '') === nipStr);
              if (pg) {
                const sc = sisaCuti.find(s => s.pegawaiId === pg.id && s.tahunN === currentYear);
                
                const sisaN2Val = row['Sisa N-2'] !== undefined ? Number(row['Sisa N-2']) : (sc ? sc.sisaN2 : 0);
                const sisaN1Val = row['Sisa N-1'] !== undefined ? Number(row['Sisa N-1']) : (sc ? sc.sisaN1 : 0);
                const sisaNVal = row['Sisa N'] !== undefined ? Number(row['Sisa N']) : (sc ? sc.sisaN : 12);

                if (sc) {
                  await updateSisaCuti(sc.id, {
                    sisaN2: sisaN2Val,
                    sisaN1: sisaN1Val,
                    sisaN: sisaNVal
                  });
                  updateCount++;
                } else {
                  await addSisaCuti({
                    pegawaiId: pg.id,
                    sisaN2: sisaN2Val,
                    sisaN1: sisaN1Val,
                    sisaN: sisaNVal,
                    tahunN: currentYear
                  });
                  insertCount++;
                }
              }
            }
          }
          showToast(`Berhasil mengimpor sisa cuti: ${insertCount} data baru ditambahkan, ${updateCount} data diperbarui.`, 'success');
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
          <h3 className="text-base font-bold text-gray-800">Manajemen Kuota Sisa Cuti Tahunan</h3>
          <p className="text-xs text-gray-500">Sesuaikan sisa saldo cuti tahunan pegawai ASN dari sisa tahun berjalan (N / 2026), sisa tahun lalu (N-1 / 2025), dan sisa dua tahun lalu (N-2 / 2024).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <button 
                onClick={() => {
                  setAddPegawaiId('');
                  setSisaN2(0);
                  setSisaN1(0);
                  setSisaN(12);
                  setAddTahunN(new Date().getFullYear());
                  setShowAddModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs font-bold mr-1"
              >
                + Tambah Saldo
              </button>
              <button 
                onClick={async () => {
                  if (confirm('Apakah Anda yakin ingin men-generate sisa cuti tahunan (default 12 hari) untuk pegawai yang belum memilikinya di tahun berjalan?')) {
                    try {
                      await generateSisaCutiNextYear();
                      showToast('Proses generate sisa cuti berhasil.', 'success');
                    } catch (e: any) {
                      showToast(`Gagal melakukan generate sisa cuti: ${e.message || e}`, 'error');
                    }
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-all text-xs font-bold mr-1"
              >
                <History className="w-3.5 h-3.5" />
                Generate Sisa Cuti N
              </button>
              
              <button 
                onClick={handleExportTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-xs font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                Template
              </button>
              
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-xs font-medium cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Import (Excel)
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  className="hidden" 
                  onChange={handleImportData}
                />
              </label>
            </>
          )}
        </div>
      </div>

      {/* Info Card BKN */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 text-xs text-blue-800">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <p className="font-bold text-blue-950">Aturan Akumulasi Cuti Tahunan (Peraturan BKN No. 5 Tahun 2017):</p>
          <ul className="list-disc pl-4 space-y-1 leading-relaxed">
            <li><strong>Cuti N (Tahun Berjalan):</strong> Hak dasar 12 hari kerja per tahun.</li>
            <li><strong>Cuti N-1 (Satu Tahun Sebelum):</strong> Maksimal akumulasi sisa kuota yang hangus adalah sisa cuti N-1 dengan ketentuan maksimal bertambah 6 hari kerja (total maksimal 18 hari kerja dengan cuti berjalan).</li>
            <li><strong>Cuti N-2 (Dua Tahun Sebelum):</strong> Maksimal akumulasi yang masih valid dari dua tahun lalu adalah maksimal 6 hari kerja. Jika tahun ini tidak diambil, kuota N-2 akan hangus di akhir tahun 2026.</li>
          </ul>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari pegawai..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        <span className="text-xs text-gray-400 font-mono">Tahun Acuan: 2026 (N)</span>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                <th className="p-4">No</th>
                <th className="p-4">NIP & Nama Pegawai</th>
                <th className="p-4 text-center bg-gray-50/80">Sisa N-2 (2024)</th>
                <th className="p-4 text-center bg-gray-50/80">Sisa N-1 (2025)</th>
                <th className="p-4 text-center bg-blue-50/20">Sisa N (2026)</th>
                <th className="p-4 text-center bg-blue-100/60 font-bold text-blue-950">Total Kuota Tersedia</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredSisaBase.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    Data saldo cuti tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredSisa.map((sc, idx) => {
                  const p = getPegawaiDetail(sc.pegawaiId);
                  if (!p) return null;
                  
                  const total = hitungTotalCutiTahunan(sc);

                  return (
                    <tr key={sc.id} className="hover:bg-gray-50/50 transition-all">
                      <td className="p-4 font-mono text-gray-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-950">{p.nama}</div>
                        <div className="text-[10px] text-gray-400 font-mono">NIP. {p.nip} • {p.statusPegawai}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-md text-xs font-bold font-mono shadow-sm">
                          {sc.sisaN2} <span className="text-[10px] font-medium text-rose-500">Hari</span>
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-bold font-mono shadow-sm">
                          {sc.sisaN1} <span className="text-[10px] font-medium text-amber-500">Hari</span>
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-bold font-mono shadow-sm">
                          {sc.sisaN} <span className="text-[10px] font-medium text-emerald-500">Hari</span>
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block bg-blue-600 text-white border border-blue-700 px-3 py-1 rounded-lg text-sm font-black font-mono shadow-sm">
                          {total} <span className="text-[10px] font-semibold text-blue-200">Hari</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          {isAdmin && (
                            <>
                              <button
                                id={`btn-edit-sisa-${sc.id}`}
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
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredSisaBase.length}
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
      )}

      {/* MODAL ADJUST BALANCES */}
      {/* MODAL TAMBAH SALDO */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-850">Tambah Saldo Cuti Tahunan</h4>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex flex-col pb-2 border-b border-gray-100">
                  <label className="text-xs font-bold text-gray-700 mb-1">Pegawai</label>
                  <select
                    required
                    value={addPegawaiId}
                    onChange={(e) => setAddPegawaiId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  >
                    <option value="">-- Pilih Pegawai --</option>
                    {pegawai.map(p => (
                      <option key={p.id} value={p.id}>{p.nama} (NIP. {p.nip})</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700">Tahun</label>
                  </div>
                  <input
                    type="number"
                    required
                    value={addTahunN}
                    onChange={(e) => setAddTahunN(Number(e.target.value))}
                    className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center font-bold font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700">Sisa Cuti N-2</label>
                  </div>
                  <input
                    type="number"
                    required
                    min={0}
                    max={12}
                    value={sisaN2}
                    onChange={(e) => setSisaN2(Math.min(12, Math.max(0, Number(e.target.value))))}
                    className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center font-bold font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700">Sisa Cuti N-1</label>
                  </div>
                  <input
                    type="number"
                    required
                    min={0}
                    max={12}
                    value={sisaN1}
                    onChange={(e) => setSisaN1(Math.min(12, Math.max(0, Number(e.target.value))))}
                    className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center font-bold font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700">Kuota Tahun Berjalan</label>
                  </div>
                  <input
                    type="number"
                    required
                    min={0}
                    max={12}
                    value={sisaN}
                    onChange={(e) => setSisaN(Math.min(12, Math.max(0, Number(e.target.value))))}
                    className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center font-bold font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer"
                >
                  Tambah Saldo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADJUST BALANCES */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-850">Sesuaikan Saldo Cuti</h4>
                <p className="text-[10px] text-gray-400 font-medium">Pegawai: {getPegawaiDetail(selectedSisa?.pegawaiId || '')?.nama}</p>
              </div>
              <button 
                id="close-modal-sisa"
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-amber-50 text-[11px] rounded text-amber-900 border border-amber-100 leading-relaxed flex gap-2">
                <History className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>Pengurangan saldo cuti tahunan berjalan akan dilakukan otomatis oleh sistem setelah pengajuan Cuti Tahunan pegawai berstatus <strong>Disetujui</strong>. Gunakan form ini hanya jika ada penyesuaian kuota master data.</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700">Sisa Cuti N-2 (2024)</label>
                    <p className="text-[9px] text-gray-400">Sisa cuti 2 tahun lalu</p>
                  </div>
                  <input
                    type="number"
                    required
                    min={0}
                    max={12}
                    value={sisaN2}
                    onChange={(e) => setSisaN2(Math.min(12, Math.max(0, Number(e.target.value))))}
                    className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center font-bold font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700">Sisa Cuti N-1 (2025)</label>
                    <p className="text-[9px] text-gray-400">Sisa cuti 1 tahun lalu</p>
                  </div>
                  <input
                    type="number"
                    required
                    min={0}
                    max={12}
                    value={sisaN1}
                    onChange={(e) => setSisaN1(Math.min(12, Math.max(0, Number(e.target.value))))}
                    className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center font-bold font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between pb-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700">Sisa Cuti N (Tahun Berjalan)</label>
                    <p className="text-[9px] text-gray-400">Kuota cuti tahun 2026</p>
                  </div>
                  <input
                    type="number"
                    required
                    min={0}
                    max={12}
                    value={sisaN}
                    onChange={(e) => setSisaN(Math.min(12, Math.max(0, Number(e.target.value))))}
                    className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center font-bold font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  id="btn-batal-sisa"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-simpan-sisa"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer"
                >
                  Terapkan Saldo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import { Search, UserCheck, Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import Pagination from './Pagination';
import { AtasanPejabat, Pegawai } from '../lib/types';
import { useToast } from '../lib/ToastContext';
import SearchableSelect from './SearchableSelect';

interface AtasanPejabatViewProps {
  atasanPejabat: AtasanPejabat[];
  pegawai: Pegawai[];
  addAtasanPejabat: (ap: Omit<AtasanPejabat, 'id'>) => void;
  updateAtasanPejabat: (id: string, ap: Partial<AtasanPejabat>) => void;
  deleteAtasanPejabat: (id: string) => void;
}

export default function AtasanPejabatView({ 
  atasanPejabat, 
  pegawai, 
  addAtasanPejabat, 
  updateAtasanPejabat, 
  deleteAtasanPejabat 
}: AtasanPejabatViewProps) {
  const { showToast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAP, setSelectedAP] = useState<AtasanPejabat | null>(null);

  // Form States
  const [pegawaiId, setPegawaiId] = useState('');
  const [peran, setPeran] = useState<'Atasan Langsung' | 'Pejabat Penanggung Jawab' | 'Kedua Peran'>('Atasan Langsung');
  const [statusActive, setStatusActive] = useState<boolean>(true);

  // Cari detail pegawai
  const getPegawaiDetail = (id: string) => {
    return pegawai.find(p => p.id === id);
  };

  const filteredAP_base = atasanPejabat.filter(ap => {
    const p = getPegawaiDetail(ap.pegawaiId);
    if (!p) return false;
    const s = searchTerm.toLowerCase();
    return p.nama.toLowerCase().includes(s) || 
           p.nip.includes(s) || 
           p.jabatan.toLowerCase().includes(s) || 
           ap.peran.toLowerCase().includes(s);
  });
  const totalPages = Math.ceil(filteredAP_base.length / itemsPerPage);
  const filteredAP = filteredAP_base.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openAddModal = () => {
    setSelectedAP(null);
    // Pilih pegawai pertama yang belum terdaftar jika memungkinkan, atau default kosong
    const availablePegawai = pegawai.length > 0 ? pegawai[0].id : '';
    setPegawaiId(availablePegawai);
    setPeran('Atasan Langsung');
    setStatusActive(true);
    setShowModal(true);
  };

  const openEditModal = (ap: AtasanPejabat) => {
    setSelectedAP(ap);
    setPegawaiId(ap.pegawaiId);
    setPeran(ap.peran);
    setStatusActive(ap.statusActive);
    setShowModal(true);
  };

  const openDeleteConfirm = (ap: AtasanPejabat) => {
    setSelectedAP(ap);
    setShowDeleteConfirm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pegawaiId) {
      showToast('Harap pilih pegawai!', 'error');
      return;
    }

    // Cek duplikasi jika tambah baru
    if (!selectedAP) {
      const duplicate = atasanPejabat.find(item => item.pegawaiId === pegawaiId);
      if (duplicate) {
        showToast('Pegawai tersebut sudah terdaftar sebagai atasan/pejabat! Silakan ubah peran yang ada.', 'error');
        return;
      }
    }

    if (selectedAP) {
      updateAtasanPejabat(selectedAP.id, { pegawaiId, peran, statusActive });
      showToast('Data atasan/pejabat berhasil diperbarui.', 'success');
    } else {
      addAtasanPejabat({ pegawaiId, peran, statusActive });
      showToast('Atasan/pejabat baru berhasil ditambahkan.', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (selectedAP) {
      deleteAtasanPejabat(selectedAP.id);
      showToast('Data atasan/pejabat berhasil dihapus.', 'info');
      setShowDeleteConfirm(false);
      setSelectedAP(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">Atasan Langsung & Pejabat Penandatangan</h3>
          <p className="text-xs text-gray-500">Tentukan daftar pejabat berwenang untuk melakukan verifikasi (Atasan Langsung) atau menandatangani persetujuan akhir (Sekda/Kabag).</p>
        </div>
        <button
          id="btn-tambah-atasan"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Atasan/Pejabat</span>
        </button>
      </div>

      {/* Search & Stats */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, NIP, atau peran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
          <span>Jumlah Pejabat Terdaftar: <strong className="text-gray-800">{filteredAP.length}</strong></span>
          <span className="text-gray-300">|</span>
          <span>Status Aktif: <strong className="text-blue-600">{atasanPejabat.filter(ap => ap.statusActive).length}</strong></span>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                <th className="p-4">No</th>
                <th className="p-4">NIP & Nama Atasan/Pejabat</th>
                <th className="p-4">Jabatan Instansi</th>
                <th className="p-4">Peran dalam Cuti</th>
                <th className="p-4">Status Keaktifan</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredAP.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    Data atasan/pejabat tidak ditemukan atau kosong.
                  </td>
                </tr>
              ) : (
                filteredAP.map((ap, idx) => {
                  const p = getPegawaiDetail(ap.pegawaiId);
                  if (!p) return null;
                  return (
                    <tr key={ap.id} className="hover:bg-gray-50/50 transition-all">
                      <td className="p-4 font-mono text-gray-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-950">{p.nama}</div>
                        <div className="text-[10px] text-gray-400 font-mono">NIP. {p.nip}</div>
                      </td>
                      <td className="p-4 text-gray-600 font-medium">{p.jabatan}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ap.peran === 'Atasan Langsung'
                            ? 'bg-blue-50 text-blue-800 border border-blue-100'
                            : ap.peran === 'Pejabat Penanggung Jawab'
                            ? 'bg-purple-50 text-purple-800 border border-purple-100'
                            : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
                        }`}>
                          {ap.peran}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ap.statusActive
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}>
                          {ap.statusActive ? 'AKTIF' : 'NON-AKTIF'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`btn-edit-atasan-${ap.id}`}
                            onClick={() => openEditModal(ap)}
                            className="p-1.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 rounded transition-all cursor-pointer"
                            title="Ubah Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-atasan-${ap.id}`}
                            onClick={() => openDeleteConfirm(ap)}
                            className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-700 border border-gray-200 rounded transition-all cursor-pointer"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
          totalItems={filteredAP_base.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* MODAL ADD / EDIT */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-850">
                {selectedAP ? 'Ubah Atasan/Pejabat' : 'Tambah Atasan/Pejabat'}
              </h4>
              <button 
                id="close-modal-atasan"
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Pilih Pegawai *</label>
                <SearchableSelect
                  disabled={!!selectedAP}
                  value={pegawaiId}
                  onChange={(val) => setPegawaiId(val)}
                  placeholder="-- Pilih Pegawai --"
                  options={pegawai.map(p => ({
                    value: p.id,
                    label: `${p.nama} (${p.jabatan})`
                  }))}
                />
                {selectedAP && (
                  <p className="text-[10px] text-gray-400 italic">Nama pegawai tidak dapat diubah saat mode Edit.</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Peran Alur Cuti *</label>
                <select
                  value={peran}
                  onChange={(e) => setPeran(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="Atasan Langsung">Atasan Langsung (Pembuat rekomendasi)</option>
                  <option value="Pejabat Penanggung Jawab">Pejabat Penanggung Jawab (Penandatangan akhir)</option>
                  <option value="Kedua Peran">Kedua Peran (Atasan Sekaligus Penandatangan Akhir)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Status Keaktifan</label>
                <select
                  value={statusActive ? 'true' : 'false'}
                  onChange={(e) => setStatusActive(e.target.value === 'true')}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="true">Aktif (Dapat dipilih dalam alur pengajuan)</option>
                  <option value="false">Non-Aktif (Sembunyikan sementara)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  id="btn-batal-atasan"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-simpan-atasan"
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
                <h4 className="text-sm font-bold text-gray-900">Hapus Atasan/Pejabat</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus hak akses atasan/pejabat untuk <strong className="text-gray-800">{getPegawaiDetail(selectedAP?.pegawaiId || '')?.nama}</strong>? Pengguna tersebut tidak akan muncul lagi di daftar pilih atasan langsung pada lembar formulir pengajuan cuti.
                </p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                id="btn-batal-delete-atasan"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-ya-delete-atasan"
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

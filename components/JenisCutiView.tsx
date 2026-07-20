'use client';

import React, { useState } from 'react';
import { Search, FileText, Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { JenisCuti } from '../lib/types';
import Pagination from './Pagination';
import { useToast } from '../lib/ToastContext';

interface JenisCutiViewProps {
  jenisCuti: JenisCuti[];
  addJenisCuti: (jc: Omit<JenisCuti, 'id'>) => void;
  updateJenisCuti: (id: string, jc: Partial<JenisCuti>) => void;
  deleteJenisCuti: (id: string) => void;
}

export default function JenisCutiView({ jenisCuti, addJenisCuti, updateJenisCuti, deleteJenisCuti }: JenisCutiViewProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedJC, setSelectedJC] = useState<JenisCuti | null>(null);

  // Form States
  const [nama, setNama] = useState('');
  const [kuotaDefault, setKuotaDefault] = useState<number>(12);
  const [keterangan, setKeterangan] = useState('');
  const [hakPegawai, setHakPegawai] = useState<'Semua' | 'PNS' | 'PPPK' | 'PPPK PW'>('Semua');

  const filteredJCBase = jenisCuti.filter(jc => 
    jc.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jc.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jc.hakPegawai.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredJCBase.length / itemsPerPage);
  const paginatedJenis = filteredJCBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openAddModal = () => {
    setSelectedJC(null);
    setNama('');
    setKuotaDefault(12);
    setKeterangan('');
    setHakPegawai('Semua');
    setShowModal(true);
  };

  const openEditModal = (jc: JenisCuti) => {
    setSelectedJC(jc);
    setNama(jc.nama);
    setKuotaDefault(jc.kuotaDefault);
    setKeterangan(jc.keterangan);
    setHakPegawai(jc.hakPegawai);
    setShowModal(true);
  };

  const openDeleteConfirm = (jc: JenisCuti) => {
    setSelectedJC(jc);
    setShowDeleteConfirm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !keterangan) {
      showToast('Harap isi semua kolom wajib!', 'error');
      return;
    }

    if (selectedJC) {
      updateJenisCuti(selectedJC.id, { nama, kuotaDefault: Number(kuotaDefault), keterangan, hakPegawai });
      showToast('Jenis cuti berhasil diperbarui.', 'success');
    } else {
      addJenisCuti({ nama, kuotaDefault: Number(kuotaDefault), keterangan, hakPegawai });
      showToast('Jenis cuti baru berhasil ditambahkan.', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (selectedJC) {
      deleteJenisCuti(selectedJC.id);
      showToast('Jenis cuti berhasil dihapus.', 'info');
      setShowDeleteConfirm(false);
      setSelectedJC(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">Master Jenis Cuti ASN</h3>
          <p className="text-xs text-gray-500">Kelola kategori jenis-jenis cuti pegawai, batas kuota default pertahun, regulasi, dan hak aksesibilitas pegawai.</p>
        </div>
        <button
          id="btn-tambah-jenis-cuti"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jenis Cuti</span>
        </button>
      </div>

      {/* Search & Stats */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari jenis cuti atau regulasi..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
          <span>Jumlah Kategori Cuti: <strong className="text-gray-800">{filteredJCBase.length}</strong></span>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                <th className="p-4">No</th>
                <th className="p-4">Jenis Cuti</th>
                <th className="p-4">Kuota Default</th>
                <th className="p-4">Keterangan / Regulasi BKN</th>
                <th className="p-4">Hak Pegawai</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredJCBase.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    Kategori jenis cuti tidak ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedJenis.map((jc, idx) => (
                  <tr key={jc.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="p-4 font-mono text-gray-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="p-4 font-bold text-gray-950">{jc.nama}</td>
                    <td className="p-4 font-semibold font-mono text-blue-700">{jc.kuotaDefault} Hari</td>
                    <td className="p-4 text-gray-500 max-w-sm leading-relaxed">{jc.keterangan}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        jc.hakPegawai === 'Semua'
                          ? 'bg-slate-100 text-slate-800 border border-slate-200'
                          : jc.hakPegawai === 'PNS'
                          ? 'bg-blue-50 text-blue-800 border border-blue-100'
                          : jc.hakPegawai === 'PPPK PW'
                          ? 'bg-teal-50 text-teal-800 border border-teal-100'
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
                      }`}>
                        {jc.hakPegawai}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          id={`btn-edit-jc-${jc.id}`}
                          onClick={() => openEditModal(jc)}
                          className="p-1.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 rounded transition-all cursor-pointer"
                          title="Ubah Data"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-delete-jc-${jc.id}`}
                          onClick={() => openDeleteConfirm(jc)}
                          className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-700 border border-gray-200 rounded transition-all cursor-pointer"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
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
          totalItems={filteredJCBase.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* MODAL ADD / EDIT */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-850">
                {selectedJC ? 'Ubah Kategori Cuti' : 'Tambah Kategori Cuti'}
              </h4>
              <button 
                id="close-modal-jc"
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Nama Jenis Cuti *</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Cuti Tahunan"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Kuota Default *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={1000}
                    value={kuotaDefault}
                    onChange={(e) => setKuotaDefault(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Hak Pegawai *</label>
                  <select
                    value={hakPegawai}
                    onChange={(e) => setHakPegawai(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    <option value="Semua">Semua ASN (PNS, PPPK, PPPK PW)</option>
                    <option value="PNS">Hanya PNS</option>
                    <option value="PPPK">Hanya PPPK</option>
                    <option value="PPPK PW">Hanya PPPK PW</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Keterangan & Regulasi *</label>
                <textarea
                  required
                  rows={4}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Deskripsikan regulasi, denda cuti, sisa akumulasi, dsb..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-justify"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  id="btn-batal-jc"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-simpan-jc"
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
                <h4 className="text-sm font-bold text-gray-900">Konfirmasi Hapus Jenis Cuti</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus jenis cuti <strong className="text-gray-800">{selectedJC?.nama}</strong>? Menghapus kategori cuti ini dapat merusak atau mengacaukan riwayat pengajuan cuti yang sudah ada dalam database.
                </p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                id="btn-batal-delete-jc"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-ya-delete-jc"
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

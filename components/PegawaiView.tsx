'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Search, UserPlus, Edit2, Trash2, X, AlertTriangle, Download, Upload } from 'lucide-react';
import { Pegawai, PengaturanUser } from '../lib/types';
import { useToast } from '../lib/ToastContext';
import Pagination from './Pagination';

interface PegawaiViewProps {
  pegawai: Pegawai[];
  addPegawai: (p: Omit<Pegawai, 'id'>) => void;
  updatePegawai: (id: string, p: Partial<Pegawai>) => void;
  deletePegawai: (id: string) => void;
  currentUser?: PengaturanUser | null;
}

export default function PegawaiView({ pegawai, addPegawai, updatePegawai, deletePegawai, currentUser }: PegawaiViewProps) {
  const { showToast } = useToast();
  const isAdmin = currentUser?.role === 'Admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);
  
  // Form States
  const [nip, setNip] = useState('');
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [golongan, setGolongan] = useState('Penata (III/c)');
  const [unitKerja, setUnitKerja] = useState('Bagian Umum');
  const [statusPegawai, setStatusPegawai] = useState<'PNS' | 'PPPK' | 'PPPK PW'>('PNS');
  const [jenisKelamin, setJenisKelamin] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [masaKerja, setMasaKerja] = useState('01 Tahun 00 Bulan');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = evt.target?.result as string;
        setQrCodeUrl(base64);
        showToast('Gambar QR Code berhasil dimuat.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const golongans = [
    'Juru Muda (I/a)', 'Juru Muda Tingkat I (I/b)', 'Juru (I/c)', 'Juru Tingkat I (I/d)',
    'Pengatur Muda (II/a)', 'Pengatur Muda Tingkat I (II/b)', 'Pengatur (II/c)', 'Pengatur Tingkat I (II/d)',
    'Penata Muda (III/a)', 'Penata Muda Tingkat I (III/b)', 'Penata (III/c)', 'Penata Tingkat I (III/d)',
    'Pembina (IV/a)', 'Pembina Tingkat I (IV/b)', 'Pembina Utama Muda (IV/c)', 'Pembina Utama Madya (IV/d)', 'Pembina Utama (IV/e)'
  ];

  const unitKerjas = [
    'Bagian Umum', 'Bagian Organisasi', 'Bagian Prokompim', 'Bagian Hukum', 'Bagian Perekonomian & SDA', 
    'Bagian Pemerintahan', 'Bagian Kesra', 'Bagian Administrasi Pembangunan', 'Bagian PBJ'
  ];

  const filteredPegawaiBase = pegawai.filter(p => 
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.nip.includes(searchTerm) ||
    p.unitKerja.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredPegawaiBase.length / itemsPerPage);
  const paginatedPegawai = filteredPegawaiBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openAddModal = () => {
    setSelectedPegawai(null);
    setNip('');
    setNama('');
    setJabatan('');
    setGolongan('Penata (III/c)');
    setUnitKerja('Bagian Umum');
    setStatusPegawai('PNS');
    setJenisKelamin('Laki-laki');
    setMasaKerja('01 Tahun 00 Bulan');
    setQrCodeUrl('');
    setShowModal(true);
  };

  const openEditModal = (p: Pegawai) => {
    setSelectedPegawai(p);
    setNip(p.nip);
    setNama(p.nama);
    setJabatan(p.jabatan);
    setGolongan(p.golongan);
    setUnitKerja(p.unitKerja);
    setStatusPegawai(p.statusPegawai);
    setJenisKelamin(p.jenisKelamin || 'Laki-laki');
    setMasaKerja(p.masaKerja || '01 Tahun 00 Bulan');
    setQrCodeUrl(p.qrCodeUrl || '');
    setShowModal(true);
  };

  const openDeleteConfirm = (p: Pegawai) => {
    setSelectedPegawai(p);
    setShowDeleteConfirm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip || !nama || !jabatan || !masaKerja) {
      showToast('Harap isi semua kolom wajib!', 'error');
      return;
    }

    if (selectedPegawai) {
      // Edit
      updatePegawai(selectedPegawai.id, {
        nip,
        nama,
        jabatan,
        golongan: '-',
        unitKerja,
        statusPegawai,
        jenisKelamin,
        masaKerja,
        noHp: '-',
        qrCodeUrl: qrCodeUrl || undefined
      });
      showToast('Data pegawai berhasil diperbarui.', 'success');
    } else {
      // Add
      addPegawai({
        nip,
        nama,
        jabatan,
        golongan: '-',
        unitKerja,
        statusPegawai,
        jenisKelamin,
        masaKerja,
        noHp: '-',
        qrCodeUrl: qrCodeUrl || undefined
      });
      showToast('Pegawai baru berhasil ditambahkan.', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (selectedPegawai) {
      deletePegawai(selectedPegawai.id);
      showToast('Data pegawai berhasil dihapus.', 'info');
      setShowDeleteConfirm(false);
      setSelectedPegawai(null);
    }
  };

  const handleExportTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { NIP: '198501012010011001', Nama: 'John Doe', Jabatan: 'Analis', UnitKerja: 'Bagian Umum', StatusPegawai: 'PNS', JenisKelamin: 'Laki-laki', MasaKerja: '10 Tahun 00 Bulan' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "template_pegawai.xlsx");
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const ab = evt.target?.result;
          const wb = XLSX.read(ab, { type: 'array' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          let count = 0;
          data.forEach((row: any) => {
            if (row.NIP && row.Nama) {
              addPegawai({
                nip: String(row.NIP).replace(/\s/g, ''),
                nama: String(row.Nama).trim(),
                jabatan: row.Jabatan ? String(row.Jabatan).trim() : '-',
                golongan: '-',
                unitKerja: row.UnitKerja ? String(row.UnitKerja).trim() : 'Bagian Umum',
                statusPegawai: String(row.StatusPegawai).trim() === 'PPPK' ? 'PPPK' : String(row.StatusPegawai).trim() === 'PPPK PW' ? 'PPPK PW' : 'PNS',
                jenisKelamin: String(row.JenisKelamin).trim() === 'Perempuan' ? 'Perempuan' : 'Laki-laki',
                masaKerja: row.MasaKerja ? String(row.MasaKerja).trim() : '01 Tahun 00 Bulan',
                noHp: '-'
              });
              count++;
            }
          });
          showToast(`Berhasil mengimpor ${count} data pegawai dari Excel.`, 'success');
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
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">Daftar Pegawai ASN Setda Demak</h3>
          <p className="text-xs text-gray-500">Kelola master data seluruh pegawai ASN (PNS & PPPK) di lingkungan Sekretariat Daerah.</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={handleExportTemplate}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Unduh Template</span>
              </button>
              
              <label className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import Data</span>
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportData} />
              </label>

              <button
                id="btn-tambah-pegawai"
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Pegawai</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search & Statistics */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, NIP, atau jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
          <span>Jumlah Pegawai Terfilter: <strong className="text-gray-800">{filteredPegawaiBase.length}</strong></span>
          <span className="text-gray-300">|</span>
          <span>PNS: <strong className="text-gray-800">{pegawai.filter(p => p.statusPegawai === 'PNS').length}</strong></span>
          <span className="text-gray-300">|</span>
          <span>PPPK: <strong className="text-gray-800">{pegawai.filter(p => p.statusPegawai === 'PPPK').length}</strong></span>
        </div>
      </div>

      {/* Grid / Tabel Pegawai */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                <th className="p-4">No</th>
                <th className="p-4">NIP & Nama Pegawai</th>
                <th className="p-4">Jenis Kelamin</th>
                <th className="p-4">Jabatan & Unit Kerja</th>
                <th className="p-4">Masa Kerja</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredPegawaiBase.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    Data pegawai tidak ditemukan atau kosong.
                  </td>
                </tr>
              ) : (
                paginatedPegawai.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="p-4 font-mono text-gray-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{p.nama}</div>
                      <div className="text-[10px] text-gray-400 font-mono font-semibold flex items-center gap-1.5">
                        <span>NIP. {p.nip}</span>
                        {p.qrCodeUrl && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded text-[8px] font-bold" title="QR Code TTE dari BKPSDM Terpasang">
                            ● QR TTE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-600">{p.jenisKelamin || 'Laki-laki'}</td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{p.jabatan}</div>
                      <div className="mt-1">
                        <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-bold">
                          {p.unitKerja}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md inline-block font-mono">
                        {p.masaKerja || '01 Tahun 00 Bulan'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.statusPegawai === 'PNS' 
                          ? 'bg-blue-50 text-blue-800 border border-blue-100' 
                          : p.statusPegawai === 'PPPK PW'
                          ? 'bg-teal-50 text-teal-800 border border-teal-100'
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
                      }`}>
                        {p.statusPegawai}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          id={`btn-edit-pegawai-${p.id}`}
                          onClick={() => openEditModal(p)}
                          className="p-1.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 rounded transition-all cursor-pointer"
                          title="Ubah Data"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            id={`btn-delete-pegawai-${p.id}`}
                            onClick={() => openDeleteConfirm(p)}
                            className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-700 border border-gray-200 rounded transition-all cursor-pointer"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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
          totalItems={filteredPegawaiBase.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* CRUD Modal (Add / Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-850">
                {selectedPegawai ? 'Ubah Data Pegawai' : 'Tambah Pegawai Baru'}
              </h4>
              <button 
                id="close-modal-pegawai"
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">NIP Pegawai (18 Digit) *</label>
                  <input
                    type="text"
                    required
                    maxLength={18}
                    value={nip}
                    onChange={(e) => setNip(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 1985xxxxxxxxxxxxxx"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>

                 <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Bagus Setyawan, S.Kom."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono font-semibold">Status Pegawai *</label>
                  <select
                    value={statusPegawai}
                    onChange={(e) => setStatusPegawai(e.target.value as 'PNS' | 'PPPK' | 'PPPK PW')}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  >
                    <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                    <option value="PPPK">PPPK (Pegawai Pemerintah dgn Perjanjian Kerja)</option>
                    <option value="PPPK PW">PPPK Paruh Waktu (PPPK PW)</option>
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Jenis Kelamin *</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as 'Laki-laki' | 'Perempuan')}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Jabatan Kerja *</label>
                  <input
                    type="text"
                    required
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    placeholder="Contoh: Analis Kebijakan Ahli Muda"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Unit Kerja / Bagian *</label>
                  <select
                    value={unitKerja}
                    onChange={(e) => setUnitKerja(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  >
                    {unitKerjas.map(uk => (
                      <option key={uk} value={uk}>{uk}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Masa Kerja (Tahun/Bulan) *</label>
                  <input
                    type="text"
                    required
                    value={masaKerja}
                    onChange={(e) => setMasaKerja(e.target.value)}
                    placeholder="Contoh: 01 Tahun 00 Bulan"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>

                <div className="col-span-2 space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                      QR Code TTE Pegawai (Dari BKPSDM)
                    </label>
                    {qrCodeUrl && (
                      <button
                        type="button"
                        onClick={() => setQrCodeUrl('')}
                        className="text-[10px] text-red-500 hover:text-red-700 font-bold transition-all"
                      >
                        Hapus QR Code
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="w-20 h-20 bg-white border border-gray-300 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="Preview QR" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-gray-300 flex flex-col items-center justify-center">
                          <span className="text-[9px] font-mono font-bold">KOSONG</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      <p className="text-[10px] text-gray-500 leading-normal">
                        Unggah file gambar QR Code milik pegawai yang diterbitkan oleh BKPSDM atau tempel URL gambarnya di bawah ini.
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <label className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1">
                          <Upload className="w-3.5 h-3.5 text-gray-500" />
                          <span>Pilih File Gambar</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
                        </label>
                        <span className="text-[10px] text-gray-400 font-medium">atau</span>
                      </div>

                      <input
                        type="text"
                        value={qrCodeUrl}
                        onChange={(e) => setQrCodeUrl(e.target.value)}
                        placeholder="Tempel URL Gambar di sini..."
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-[10px] text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  id="btn-batal-pegawai"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-simpan-pegawai"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer"
                >
                  Simpan Data
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
                <h4 className="text-sm font-bold text-gray-900">Konfirmasi Hapus Pegawai</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus data pegawai <strong className="text-gray-800">{selectedPegawai?.nama}</strong>? Tindakan ini bersifat permanen dan akan menghapus sisa cuti serta riwayat pengajuannya.
                </p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                id="btn-batal-delete"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-ya-delete"
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

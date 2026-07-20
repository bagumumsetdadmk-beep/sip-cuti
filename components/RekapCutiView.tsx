'use client';

import React, { useState } from 'react';
import { Search, Printer, FileSpreadsheet } from 'lucide-react';
import { Pegawai, JenisCuti, PengaturanUser } from '../lib/types';

interface RekapCutiViewProps {
  pegawai: Pegawai[];
  jenisCuti: JenisCuti[];
  dapatkanRekapCuti: () => {
    pegawai: Pegawai;
    rekap: { [key: string]: number };
  }[];
  currentUser?: PengaturanUser | null;
}

export default function RekapCutiView({ pegawai, jenisCuti, dapatkanRekapCuti, currentUser }: RekapCutiViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  
  const rekapData = dapatkanRekapCuti();

  const filteredRekap = rekapData.filter(item => {
    const s = searchTerm.toLowerCase();
    return item.pegawai.nama.toLowerCase().includes(s) || 
           item.pegawai.nip.includes(s) || 
           item.pegawai.unitKerja.toLowerCase().includes(s);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h3 className="text-base font-bold text-gray-800">Rekapitulasi Pengambilan Cuti Pegawai</h3>
          <p className="text-xs text-gray-500">Kompilasi total hari cuti yang telah diambil/digunakan oleh seluruh pegawai ASN berdasarkan masing-masing jenis cuti resmi.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan Rekap</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 no-print">
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
        <p className="text-[11px] text-gray-400 italic">Mencakup seluruh data pengajuan cuti berstatus &quot;Disetujui&quot; pada tahun 2026.</p>
      </div>

      {/* Layout Printable Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 printable-report">
        {/* Kop Surat Header saat Dicetak */}
        <div className="hidden print-only text-center border-b-2 border-gray-900 pb-4 mb-6">
          <h2 className="font-bold text-sm uppercase">PEMERINTAH KABUPATEN DEMAK</h2>
          <h1 className="font-extrabold text-base uppercase">SEKRETARIAT DAERAH</h1>
          <p className="text-xs">Jl. Kyai Singgkil No. 7, Demak, Jawa Tengah 59511 • Telp: (0291) 685112</p>
          <div className="border-t border-gray-600 mt-2 pt-2">
            <h3 className="font-bold text-xs uppercase underline">LAPORAN REKAPITULASI PENYALURAN CUTI PEGAWAI ASN TAHUN 2026</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                <th className="p-3 border border-gray-200">No</th>
                <th className="p-3 border border-gray-200">NIP & Nama Pegawai</th>
                <th className="p-3 border border-gray-200">Unit Kerja</th>
                {jenisCuti.map(jc => (
                  <th key={jc.id} className="p-3 text-center border border-gray-200 max-w-24">
                    <p className="line-clamp-2 leading-tight">{jc.nama}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredRekap.length === 0 ? (
                <tr>
                  <td colSpan={3 + jenisCuti.length} className="p-8 text-center text-gray-400">
                    Tidak ada data rekapitulasi pegawai.
                  </td>
                </tr>
              ) : (
                filteredRekap.map((item, idx) => (
                  <tr key={item.pegawai.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="p-3 font-mono text-gray-400 border border-gray-200">{idx + 1}</td>
                    <td className="p-3 border border-gray-200">
                      <div className="font-bold text-gray-950 leading-tight">{item.pegawai.nama}</div>
                      <div className="text-[9px] text-gray-400 font-mono mt-0.5">NIP. {item.pegawai.nip} ({item.pegawai.statusPegawai})</div>
                    </td>
                    <td className="p-3 border border-gray-200">
                      <span className="font-medium text-gray-600">{item.pegawai.unitKerja}</span>
                    </td>
                    
                    {/* Render tiap-tiap jumlah cuti yang sudah diambil */}
                    {jenisCuti.map(jc => {
                      const diambil = item.rekap[jc.id] || 0;
                      return (
                        <td key={jc.id} className="p-3 text-center border border-gray-200 font-bold font-mono">
                          {diambil > 0 ? (
                            <span className="bg-amber-50 text-amber-800 border border-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                              {diambil} Hari
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan Cetak */}
        <div className="hidden print-only mt-12 grid grid-cols-2 text-xs">
          <div />
          <div className="text-center space-y-16">
            <div>
              <p>Demak, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold">Sekretaris Daerah Kabupaten Demak</p>
            </div>
            <div>
              <p className="font-bold underline">Drs. Akhmad Sugiharto, S.T., M.T.</p>
              <p>Pembina Utama Madya</p>
              <p>NIP. 197805122005011002</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

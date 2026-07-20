'use client';

import React from 'react';
import { 
  Users, 
  FileClock, 
  FileCheck, 
  FileWarning, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Pegawai, PengajuanCuti, JenisCuti } from '../lib/types';

interface DashboardViewProps {
  pegawai: Pegawai[];
  pengajuan: PengajuanCuti[];
  jenisCuti: JenisCuti[];
  setCurrentMenu: (menu: string) => void;
  currentUser: {
    role: string;
    nama: string;
    pegawaiId?: string;
  } | null;
}

export default function DashboardView({ 
  pegawai, 
  pengajuan, 
  jenisCuti, 
  setCurrentMenu,
  currentUser
}: DashboardViewProps) {
  
  // Hitung KPI Statistik
  const totalPegawai = pegawai.length;
  const totalPengajuan = pengajuan.length;
  const totalDisetujui = pengajuan.filter(p => p.status === 'Disetujui').length;
  const totalPerbaikan = pengajuan.filter(p => p.status === 'Dalam Perbaikan').length;
  const totalMenunggu = pengajuan.filter(p => p.status === 'Menunggu' || p.status === 'Sudah Diperbaiki').length;

  // Temukan nama pegawai dari ID
  const getPegawaiNama = (id: string) => {
    return pegawai.find(p => p.id === id)?.nama || 'Pegawai Tidak Ditemukan';
  };

  const getPegawaiNip = (id: string) => {
    return pegawai.find(p => p.id === id)?.nip || '-';
  };

  const getJenisCutiNama = (id: string) => {
    return jenisCuti.find(jc => jc.id === id)?.nama || 'Cuti';
  };

  // Filter pengajuan terbaru
  const pengajuanTerbaru = pengajuan.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm text-white">
        <div className="max-w-2xl">
          <span className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded font-bold font-mono tracking-wide uppercase">
            SISTEM AKTIF
          </span>
          <h1 className="text-xl font-bold mt-3 text-white">
            Selamat Datang di Portal SIP-Cuti Setda Kabupaten Demak
          </h1>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Aplikasi manajemen pengajuan, verifikasi, dan pencetakan formulir cuti resmi ASN di lingkungan Sekretariat Daerah Kabupaten Demak berdasarkan Peraturan Badan Kepegawaian Negara (BKN) RI Nomor 5 Tahun 2017.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Pegawai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">Total Pegawai ASN</p>
            <h3 className="text-2xl font-black text-slate-800">{totalPegawai}</h3>
            <p className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Aktif Terdaftar</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card Pengajuan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">Total Pengajuan</p>
            <h3 className="text-2xl font-black text-slate-800">{totalPengajuan}</h3>
            <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{totalMenunggu} Menunggu Approval</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <FileClock className="w-6 h-6" />
          </div>
        </div>

        {/* Card Disetujui */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">Cuti Disetujui</p>
            <h3 className="text-2xl font-black text-green-700">{totalDisetujui}</h3>
            <p className="text-[10px] text-gray-400">Siap untuk dicetak</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card Perbaikan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">Perlu Perbaikan</p>
            <h3 className="text-2xl font-black text-red-700">{totalPerbaikan}</h3>
            <p className="text-[10px] text-red-500 font-medium">Revisi berkas/atasan</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <FileWarning className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column Kiri - Feed Pengajuan Terbaru */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>Daftar Pengajuan Cuti Terbaru</span>
            </h4>
            <button 
              id="view-all-leaves"
              onClick={() => setCurrentMenu('pengajuan')}
              className="text-xs text-blue-600 font-bold hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {pengajuanTerbaru.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs border border-dashed border-slate-200 rounded-xl">
                Tidak ada pengajuan cuti saat ini.
              </div>
            ) : (
              pengajuanTerbaru.map(p => {
                const statusStyles: Record<string, string> = {
                  'Menunggu': 'bg-amber-50 text-amber-700 border-amber-200',
                  'Disetujui': 'bg-green-50 text-green-700 border-green-200',
                  'Ditolak': 'bg-red-50 text-red-700 border-red-200',
                  'Dalam Perbaikan': 'bg-orange-50 text-orange-700 border-orange-200',
                  'Sudah Diperbaiki': 'bg-blue-50 text-blue-700 border-blue-200'
                };
                return (
                  <div key={p.id} className="p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800">{getPegawaiNama(p.pegawaiId)}</span>
                        <span className="text-[10px] text-slate-400 font-mono">NIP: {getPegawaiNip(p.pegawaiId)}</span>
                      </div>
                      <p className="text-slate-500 font-medium">
                        {getJenisCutiNama(p.jenisCutiId)} • {p.jumlahHari} hari kerja ({p.tanggalMulai} s.d {p.tanggalSelesai})
                      </p>
                      <p className="text-[11px] text-slate-400 italic">Alasan: &quot;{p.alasan}&quot;</p>
                    </div>
                    <div className="flex items-center gap-2 justify-end shrink-0">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${statusStyles[p.status]}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column Kanan - Informasi Cuti & Regulasi */}
        <div className="bg-[#3b82f6] text-white p-6 rounded-2xl shadow-md space-y-4 flex flex-col justify-between border-0">
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide uppercase font-mono mb-4">Aturan Pengajuan Cuti BKN</h4>
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-white/10 rounded-xl border border-white/20 text-[11px] leading-relaxed">
                <p className="font-bold text-white mb-1 flex items-center gap-1">
                  <span>Aturan Cuti Tahunan (N)</span>
                </p>
                Hak Cuti Tahunan yang tidak digunakan pada tahun berjalan dapat diakumulasikan ke tahun berikutnya maksimal 6 hari kerja (Sisa Cuti N-1), dan jika tidak digunakan kembali masih bisa ditarik maksimal 6 hari kerja pada tahun N-2.
              </div>

              <div className="p-3.5 bg-white/10 rounded-xl border border-white/20 text-[11px] leading-relaxed">
                <p className="font-bold text-white mb-1">Perbedaan PNS & PPPK</p>
                PNS memiliki hak atas 6 jenis cuti (Tahunan, Sakit, Melahirkan, Alasan Penting, Besar, CLTN). PPPK memiliki batasan hak tertentu dan tidak berhak mengajukan Cuti Besar maupun Cuti di Luar Tanggungan Negara (CLTN).
              </div>

              <div className="p-3.5 bg-white/10 rounded-xl border border-white/20 text-[11px] leading-relaxed">
                <p className="font-bold text-white mb-1">Penting Bagi Operator & Verifikator</p>
                Pastikan tanggal pengajuan tidak tumpang tindih dengan hari libur nasional atau cuti bersama yang sudah terdaftar dalam modul Hari Libur sistem.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

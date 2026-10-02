'use client';

import React from 'react';
import { 
  Users, 
  FileClock, 
  FileCheck, 
  FileWarning, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Calendar,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Pegawai, PengajuanCuti, JenisCuti } from '../lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

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
  
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const currentYearNow = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = React.useState<number | 'Semua'>(currentYearNow);

  // 3 Tahun Utama (N, N-1, N-2) dengan batas minimal tahun 2024
  const primaryYears = React.useMemo(() => {
    const list: number[] = [];
    for (let i = 0; i < 3; i++) {
      const yr = currentYearNow - i;
      if (yr >= 2024) {
        list.push(yr);
      }
    }
    return list;
  }, [currentYearNow]);

  // List of all years from data (minimal 2024)
  const availableYears = React.useMemo(() => {
    const years = new Set<number>();
    // Pastikan tahun utama masuk
    primaryYears.forEach(y => years.add(y));

    // Tambahkan tahun dari data pengajuan (hanya >= 2024)
    pengajuan.forEach(p => {
      const dateStr = p.tanggalPengajuan || p.tanggalMulai;
      if (dateStr) {
        const y = parseInt(dateStr.split('-')[0], 10);
        if (!isNaN(y) && y >= 2024) {
          years.add(y);
        }
      }
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [pengajuan, primaryYears]);

  // Tahun-tahun lama (sebelum N-2 tetapi tetap >= 2024) untuk menu dropdown jika kelak tahun bertambah (misal 2027, 2028, dst.)
  const olderYears = React.useMemo(() => {
    const minPrimary = primaryYears.length > 0 ? Math.min(...primaryYears) : currentYearNow;
    const oldSet = new Set<number>();
    
    // Hanya ambil tahun riwayat yang lebih lama dari 3 tahun utama dan minimal 2024
    availableYears.forEach(yr => {
      if (yr < minPrimary && yr >= 2024) {
        oldSet.add(yr);
      }
    });

    return Array.from(oldSet).sort((a, b) => b - a);
  }, [availableYears, primaryYears, currentYearNow]);

  const isOlderYearSelected = typeof selectedYear === 'number' && !primaryYears.includes(selectedYear);

  // Filter pengajuan berdasarkan tahun yang dipilih
  const filteredPengajuan = React.useMemo(() => {
    if (selectedYear === 'Semua') {
      return pengajuan;
    }
    return pengajuan.filter(p => {
      const dateStr = p.tanggalPengajuan || p.tanggalMulai;
      if (!dateStr) return false;
      const y = parseInt(dateStr.split('-')[0], 10);
      return y === selectedYear;
    });
  }, [pengajuan, selectedYear]);

  // Hitung KPI Statistik berdasarkan filter tahun
  const totalPegawai = pegawai.length;
  const totalPengajuan = filteredPengajuan.length;
  const totalDisetujui = filteredPengajuan.filter(p => p.status === 'Disetujui').length;
  const totalPerbaikan = filteredPengajuan.filter(p => p.status === 'Dalam Perbaikan').length;
  const totalMenunggu = filteredPengajuan.filter(p => p.status === 'Menunggu' || p.status === 'Sudah Diperbaiki').length;

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

  const isHariKalender = (jenisCutiId: string) => {
    const selected = jenisCuti.find(jc => jc.id === jenisCutiId);
    if (!selected) return false;
    const nameLower = selected.nama.toLowerCase();
    const isHariKerja = nameLower.includes('tahunan') || nameLower.includes('alasan penting') || nameLower.includes('penting');
    return !isHariKerja;
  };

  // Filter pengajuan terbaru (dari list terfilter atau global)
  const pengajuanTerbaru = filteredPengajuan.slice(0, 5);

  // Mengelompokkan data pengajuan berdasarkan bulan (Format Indonesia)
  const namaBulan = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const chartYear = selectedYear === 'Semua' ? currentYearNow : selectedYear;

  const chartData = namaBulan.map((nama) => ({
    name: nama,
    'Total Pengajuan': 0,
    'Disetujui': 0
  }));

  pengajuan.forEach(p => {
    const dateStr = p.tanggalPengajuan || p.tanggalMulai;
    if (dateStr) {
      const parts = dateStr.split('-');
      if (parts.length >= 2) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 0-indexed
        
        if (year === chartYear && !isNaN(month) && month >= 0 && month < 12) {
          chartData[month]['Total Pengajuan'] += 1;
          if (p.status === 'Disetujui') {
            chartData[month]['Disetujui'] += 1;
          }
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Warna Gelap Elegan */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl border border-slate-800 shadow-md text-white relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-md text-xs font-bold font-mono tracking-wide uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            SISTEM INFORMASI PENGAJUAN CUTI ASN
          </div>
          <h1 className="text-xl font-black mt-3 text-white tracking-tight">
            Selamat Datang di Aplikasi SIP-Cuti Setda Kabupaten Demak
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed font-normal">
            Aplikasi manajemen pengajuan, verifikasi, dan pencetakan formulir cuti ASN di lingkungan Sekretariat Daerah Kabupaten Demak.
          </p>
        </div>
      </div>

      {/* Filter Tahun Pengajuan Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Filter Tahun Pengajuan</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-medium">
                {selectedYear === 'Semua' ? 'Semua Periode' : `Tahun ${selectedYear}`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Pilih tahun untuk menampilkan statistik permohonan cuti ASN
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* 3 Tombol Cepat: N, N-1, N-2 */}
          {primaryYears.map(yr => (
            <button
              key={yr}
              type="button"
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-mono ${
                selectedYear === yr 
                  ? 'bg-blue-600 text-white shadow-xs border border-blue-700' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {yr} {yr === currentYearNow ? '(Tahun Berjalan)' : ''}
            </button>
          ))}

          {/* Dropdown Pilihan Tahun Sebelumnya (> 2 tahun lalu, hanya muncul jika ada data tahun lama seperti 2024 ketika nanti berada di 2027+) */}
          {olderYears.length > 0 && (
            <div className="relative inline-block">
              <select
                aria-label="Pilih arsip tahun lainnya"
                value={isOlderYearSelected ? (selectedYear as number) : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    setSelectedYear(parseInt(val, 10));
                  }
                }}
                className={`appearance-none text-xs font-bold font-mono pl-3 pr-7 py-1.5 rounded-lg border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isOlderYearSelected
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <option value="" disabled className="bg-white text-slate-700">
                  {isOlderYearSelected ? `Tahun ${selectedYear}` : 'Tahun Lainnya ▾'}
                </option>
                {olderYears.map(yr => (
                  <option key={yr} value={yr} className="bg-white text-slate-800">
                    Tahun {yr}
                  </option>
                ))}
              </select>
              <ChevronDown className={`w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                isOlderYearSelected ? 'text-white' : 'text-slate-500'
              }`} />
            </div>
          )}

          {/* Tombol Semua Tahun */}
          <button
            type="button"
            onClick={() => setSelectedYear('Semua')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedYear === 'Semua' 
                ? 'bg-blue-600 text-white shadow-xs border border-blue-700' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            Semua Tahun
          </button>
        </div>
      </div>

      {/* KPI Stats Grid - Warna Pastel Muda */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Pegawai - Biru Muda */}
        <div className="bg-sky-50/90 hover:bg-sky-50 p-5 rounded-2xl border border-sky-200 shadow-sm flex items-center justify-between transition-all">
          <div className="space-y-1">
            <p className="text-xs font-bold text-sky-700/80 uppercase tracking-wider font-mono">Total Pegawai ASN</p>
            <h3 className="text-2xl font-black text-sky-950">{totalPegawai}</h3>
            <p className="text-[10px] text-sky-700 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Aktif Terdaftar</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white text-sky-600 flex items-center justify-center border border-sky-200 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card Pengajuan - Kuning/Amber Muda */}
        <div className="bg-amber-50/90 hover:bg-amber-50 p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-amber-700/80 uppercase tracking-wider font-mono">Total Pengajuan</p>
              <span className="text-[9px] bg-amber-200/70 text-amber-900 px-1.5 py-0.2 rounded font-mono font-bold">
                {selectedYear === 'Semua' ? 'Semua' : selectedYear}
              </span>
            </div>
            <h3 className="text-2xl font-black text-amber-950">{totalPengajuan}</h3>
            <p className="text-[10px] text-amber-800 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{totalMenunggu} Menunggu Approval</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
            <FileClock className="w-6 h-6" />
          </div>
        </div>

        {/* Card Disetujui - Hijau Muda */}
        <div className="bg-emerald-50/90 hover:bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-emerald-700/80 uppercase tracking-wider font-mono">Cuti Disetujui</p>
              <span className="text-[9px] bg-emerald-200/70 text-emerald-900 px-1.5 py-0.2 rounded font-mono font-bold">
                {selectedYear === 'Semua' ? 'Semua' : selectedYear}
              </span>
            </div>
            <h3 className="text-2xl font-black text-emerald-950">{totalDisetujui}</h3>
            <p className="text-[10px] text-emerald-700 font-semibold">Siap untuk dicetak</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card Perbaikan - Merah Muda / Pink */}
        <div className="bg-rose-50/90 hover:bg-rose-50 p-5 rounded-2xl border border-rose-200 shadow-sm flex items-center justify-between transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-rose-700/80 uppercase tracking-wider font-mono">Perlu Perbaikan</p>
              <span className="text-[9px] bg-rose-200/70 text-rose-900 px-1.5 py-0.2 rounded font-mono font-bold">
                {selectedYear === 'Semua' ? 'Semua' : selectedYear}
              </span>
            </div>
            <h3 className="text-2xl font-black text-rose-950">{totalPerbaikan}</h3>
            <p className="text-[10px] text-rose-700 font-semibold">Revisi berkas/atasan</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white text-rose-600 flex items-center justify-center border border-rose-200 shadow-xs">
            <FileWarning className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column Kiri - Grafik Statistik Cuti */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Grafik Statistik Pengajuan Cuti Bulanan
              </h4>
              <p className="text-[11px] text-slate-400">
                Visualisasi jumlah permohonan - permohonan disetujui (Tahun {chartYear})
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 block"></span>
                <span className="text-slate-600">Total Pengajuan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 block"></span>
                <span className="text-slate-600">Disetujui</span>
              </div>
            </div>
          </div>

          <div className="pt-2 h-[280px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e2e8f0', 
                      borderRadius: '0.75rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                    }}
                    labelClassName="font-bold text-xs text-slate-800"
                    itemStyle={{ fontSize: 11 }}
                  />
                  <Bar 
                    dataKey="Total Pengajuan" 
                    fill="#2563eb" 
                    radius={[3, 3, 0, 0]} 
                    maxBarSize={24}
                  />
                  <Bar 
                    dataKey="Disetujui" 
                    fill="#059669" 
                    radius={[3, 3, 0, 0]} 
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                Memuat data grafik...
              </div>
            )}
          </div>
        </div>

        {/* Column Kanan - Feed Pengajuan Terbaru */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>Pengajuan Cuti Terbaru</span>
                {selectedYear !== 'Semua' && (
                  <span className="text-[10px] font-normal text-slate-400 font-mono">({selectedYear})</span>
                )}
              </h4>
              <button 
                id="view-all-leaves"
                onClick={() => setCurrentMenu('pengajuan')}
                className="text-[11px] text-blue-600 font-bold hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {pengajuanTerbaru.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  Tidak ada pengajuan cuti pada periode ini.
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
                    <div key={p.id} className="p-3 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/5 transition-all space-y-1 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 leading-tight line-clamp-1">{getPegawaiNama(p.pegawaiId)}</p>
                          <p className="text-[10px] text-slate-400 font-mono">NIP. {getPegawaiNip(p.pegawaiId)}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${statusStyles[p.status]} shrink-0`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium text-[11px]">
                        {getJenisCutiNama(p.jenisCutiId)} • {p.jumlahHari} {isHariKalender(p.jenisCutiId) ? 'hari kalender' : 'hari kerja'}
                      </p>
                      <p className="text-[10px] text-slate-400 italic line-clamp-1">
                        &quot;{p.alasan}&quot;
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

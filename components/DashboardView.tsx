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

  const currentYear = 2026; // Sesuai tahun aktif sistem (2026)
  
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

  // Mengelompokkan data pengajuan berdasarkan bulan (Format Indonesia)
  const namaBulan = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
  ];

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
        
        if (year === currentYear && !isNaN(month) && month >= 0 && month < 12) {
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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-sky-100/90 via-sky-50/50 to-white p-6 rounded-2xl border border-sky-200/80 shadow-sm text-slate-800">
        <div className="max-w-2xl">
          <span className="text-xs bg-sky-200/80 text-sky-900 px-2.5 py-1 rounded font-bold font-mono tracking-wide uppercase">
            SISTEM AKTIF
          </span>
          <h1 className="text-xl font-bold mt-3 text-slate-800">
            Selamat Datang di Aplikasi SIP-Cuti Setda Kabupaten Demak
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Aplikasi manajemen pengajuan, verifikasi, dan pencetakan formulir cuti ASN di lingkungan Sekretariat Daerah Kabupaten Demak
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
        {/* Column Kiri - Grafik Statistik Cuti */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Grafik Statistik Pengajuan Cuti Bulanan
              </h4>
              <p className="text-[11px] text-slate-400">
                Visualisasi jumlah permohonan vs permohonan disetujui (Tahun {currentYear})
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

        {/* Column Kanan - Feed Pengajuan Terbaru (Menggantikan Aturan BKN) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>Pengajuan Cuti Terbaru</span>
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
                        {getJenisCutiNama(p.jenisCutiId)} • {p.jumlahHari} hari
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

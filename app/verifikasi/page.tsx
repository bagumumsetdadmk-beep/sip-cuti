'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Search, Calendar, User, MapPin, Phone, ArrowLeft, Award, Lock } from 'lucide-react';
import { initialPengajuanCuti, initialPegawai, initialJenisCuti, defaultPengaturanInstansi } from '../../lib/initialData';
import { PengajuanCuti, Pegawai, JenisCuti, PengaturanInstansi } from '../../lib/types';
import CetakCutiView from '../../components/CetakCutiView';

export default function VerifikasiPage() {
  const [searchId, setSearchId] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('id') || urlParams.get('nomor') || '';
    }
    return '';
  });

  const [searched, setSearched] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return !!(urlParams.get('id') || urlParams.get('nomor'));
    }
    return false;
  });

  const [pegawaiList] = useState<Pegawai[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sip_cuti_pegawai');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored pegawai:', e);
      }
    }
    return initialPegawai;
  });

  const [jenisCutiList] = useState<JenisCuti[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sip_cuti_jenis_cuti');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored jenis cuti:', e);
      }
    }
    return initialJenisCuti;
  });

  const [pengajuanList] = useState<PengajuanCuti[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sip_cuti_pengajuan');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored pengajuan:', e);
      }
    }
    return initialPengajuanCuti;
  });

  const [sisaCutiList] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sip_cuti_sisa_cuti');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored sisa cuti:', e);
      }
    }
    return [];
  });

  const [instansiData] = useState<PengaturanInstansi>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sip_cuti_instansi');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored instansi:', e);
      }
    }
    return defaultPengaturanInstansi;
  });

  // Derive active pengajuan secara langsung saat render
  const targetQuery = searchId.trim().toLowerCase();
  const activePengajuan: PengajuanCuti | null = targetQuery 
    ? (pengajuanList.find(p => 
        p.id.toLowerCase() === targetQuery || 
        (p.nomorSurat && p.nomorSurat.toLowerCase() === targetQuery) ||
        (p.nomorSurat && p.nomorSurat.toLowerCase().includes(targetQuery))
      ) || null)
    : null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const getPegawaiDetail = (id?: string) => {
    if (!id) return null;
    return pegawaiList.find(p => p.id === id) || null;
  };

  const getJenisCutiNama = (id?: string) => {
    if (!id) return '-';
    return jenisCutiList.find(jc => jc.id === id)?.nama || '-';
  };

  const formatDateIndo = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const pemohon = getPegawaiDetail(activePengajuan?.pegawaiId);
  const atasan = getPegawaiDetail(activePengajuan?.atasanId);
  const pejabat = getPegawaiDetail(activePengajuan?.pejabatId);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans text-slate-800">
      
      {/* Top Header Bar */}
      <header className="bg-emerald-900 text-white shadow-md border-b border-emerald-800 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-white/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={instansiData.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Lambang_Kabupaten_Demak.png/800px-Lambang_Kabupaten_Demak.png"} 
                alt="Logo Pemkab Demak" 
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
                PORTAL VERIFIKASI DOKUMEN CUTI DIGITAL
              </h1>
              <p className="text-[10px] sm:text-xs text-emerald-200 font-mono">
                {instansiData.namaInstansi || 'Sekretariat Daerah Kabupaten Demak'}
              </p>
            </div>
          </div>

          <Link 
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-xs font-semibold transition-all border border-emerald-600/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kembali ke Aplikasi</span>
            <span className="sm:hidden">Aplikasi</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* Search Bar Container */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Cari & Verifikasi Keabsahan Surat Cuti ASN
          </label>
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Masukkan ID Pengajuan Cuti (misal: CUTI-2026-001) atau Nomor Surat..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verifikasi Berkas</span>
            </button>
          </form>
          <p className="text-[11px] text-slate-500 italic">
            * Pindai QR Code pada Formulir Cuti fisik untuk otomatis memverifikasi keabsahan dokumen dan sertifikat TTE BSrE/BSSN.
          </p>
        </div>

        {/* Verification Result Section */}
        {activePengajuan ? (
          <div className="w-full max-w-4xl mx-auto">
             <CetakCutiView 
                pengajuan={pengajuanList}
                pegawai={pegawaiList}
                jenisCuti={jenisCutiList}
                sisaCuti={sisaCutiList}
                instansi={instansiData}
                mode="verifikasi"
                verifikasiPengajuanId={activePengajuan.id}
                onTutupVerifikasi={() => { window.close(); }}
             />
          </div>
        ) : searched ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center space-y-3">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Dokumen Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              ID atau Nomor Surat <strong className="font-mono text-slate-700">&quot;{searchId}&quot;</strong> tidak ditemukan dalam database SIP-CUTI Setda Kabupaten Demak. Mohon periksa kembali nomor yang Anda masukkan.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Selamat Datang di Portal Verifikasi Cuti ASN</h3>
              <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1">
                Silakan masukkan ID Pengajuan Cuti atau pindai QR Code yang tertera pada Formulir Cuti Fisik/PDF resmi BKN untuk memeriksa integritas dan status persetujuan elektronik.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 px-4 text-center border-t border-slate-800 font-mono">
        <p className="font-semibold text-slate-300">SIP-CUTI SETDA KABUPATEN DEMAK © 2026</p>
        <p className="text-[10px] text-slate-500 mt-0.5">Sistem Informasi Pengajuan Cuti ASN Sekretariat Daerah Kabupaten Demak</p>
      </footer>

    </div>
  );
}

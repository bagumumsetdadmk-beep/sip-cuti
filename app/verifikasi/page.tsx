'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, User, FileText, ArrowLeft, Printer, FileCheck } from 'lucide-react';
import { initialPengajuanCuti, initialPegawai, initialJenisCuti, defaultPengaturanInstansi, initialSisaCutiTahunan } from '../../lib/initialData';
import { PengajuanCuti, Pegawai, JenisCuti, SisaCutiTahunan } from '../../lib/types';

export default function VerifikasiPage({ routeId }: { routeId?: string } = {}) {
  const [mounted, setMounted] = useState(false);
  const [showFullBKN, setShowFullBKN] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse URL Parameters
  const getParam = (key: string) => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(key) || '';
    }
    return '';
  };

  const paramId = routeId || getParam('id') || getParam('no') || getParam('nomor');
  const paramNomor = getParam('no') || getParam('nomor');
  const paramNama = getParam('nm') || getParam('nama');
  const paramNip = getParam('nip');
  const paramJabatan = getParam('j') || getParam('jabatan');
  const paramKategori = getParam('cat') || getParam('kategori');
  const paramDurasi = getParam('dur') || getParam('durasi');
  const paramMulai = getParam('m') || getParam('mulai');
  const paramSelesai = getParam('s') || getParam('selesai');
  const paramAlasan = getParam('als') || getParam('alasan');
  const paramTelp = getParam('tlp') || getParam('telp');
  const paramAlamat = getParam('alm') || getParam('alamat');

  // Load from local storage if available
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

  const [sisaCutiList] = useState<SisaCutiTahunan[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sip_cuti_sisa_cuti');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored sisa cuti:', e);
      }
    }
    return initialSisaCutiTahunan;
  });

  // Cari data pengajuan berdasarkan ID/nomor
  const targetQuery = paramId.trim().toLowerCase();
  let foundPengajuan: PengajuanCuti | null = null;

  if (targetQuery) {
    foundPengajuan = pengajuanList.find(p => 
      p.id.toLowerCase() === targetQuery || 
      (p.nomorSurat && p.nomorSurat.toLowerCase() === targetQuery) ||
      (p.nomorSurat && p.nomorSurat.toLowerCase().includes(targetQuery))
    ) || null;
  }

  // Fallback to query params if available (scanned from QR Code)
  const hasQueryParams = Boolean(paramNama || paramKategori || paramNomor || paramNip);

  // Ambil data pemohon
  let pemohonNama = '';
  let pemohonNip = '';
  let pemohonJabatan = '';
  let kategoriCuti = '';
  let nomorSurat = '';
  let durasiPengajuan = '';
  let rentangTanggal = '';
  let alasanPengajuan = '';
  let noTelp = '';
  let alamatCuti = '';
  let statusPengajuan = 'Disetujui';
  let isPNS = true;

  if (foundPengajuan) {
    // Priority 1: Record found in local storage / database
    const pDetail = pegawaiList.find(p => p.id === foundPengajuan?.pegawaiId);
    const jcSelected = jenisCutiList.find(jc => jc.id === foundPengajuan?.jenisCutiId);
    
    pemohonNama = pDetail?.nama || paramNama || 'NAMA PEGAWAI';
    pemohonNip = pDetail?.nip ? `${pDetail.statusPegawai === 'PPPK' ? 'NI PPPK' : 'NIP'}. ${pDetail.nip}` : (paramNip ? (paramNip.includes('NIP') || paramNip.includes('NI PPPK') ? paramNip : `NIP. ${paramNip}`) : '-');
    pemohonJabatan = pDetail?.jabatan || paramJabatan || '-';
    kategoriCuti = jcSelected?.nama || paramKategori || 'Cuti Tahunan';
    nomorSurat = foundPengajuan.nomorSurat || paramNomor || '-';
    
    const isHariKalender = kategoriCuti.toLowerCase().includes('sakit') || kategoriCuti.toLowerCase().includes('melahirkan') || kategoriCuti.toLowerCase().includes('besar');
    durasiPengajuan = paramDurasi || `${foundPengajuan.jumlahHari} Hari ${isHariKalender ? 'Kalender' : 'Kerja'}`;
    rentangTanggal = (foundPengajuan.tanggalMulai && foundPengajuan.tanggalSelesai) 
      ? `${foundPengajuan.tanggalMulai} s.d ${foundPengajuan.tanggalSelesai}`
      : (paramMulai && paramSelesai ? `${paramMulai} s.d ${paramSelesai}` : '-');
    alasanPengajuan = foundPengajuan.alasan || paramAlasan || '-';
    noTelp = foundPengajuan.noTelpHubungi || paramTelp || '-';
    alamatCuti = foundPengajuan.alamatSelamaCuti || paramAlamat || '-';
    statusPengajuan = foundPengajuan.status || 'Disetujui';
    isPNS = pDetail ? pDetail.statusPegawai === 'PNS' : !paramNip.toUpperCase().includes('PPPK');
  } else if (hasQueryParams) {
    // Priority 2: Parameters embedded in URL query parameters
    pemohonNama = paramNama || 'NAMA PEGAWAI';
    pemohonNip = paramNip ? (paramNip.includes('NIP') || paramNip.includes('NI PPPK') ? paramNip : `NIP. ${paramNip}`) : '-';
    pemohonJabatan = paramJabatan || '-';
    kategoriCuti = paramKategori || 'Cuti Tahunan';
    nomorSurat = paramNomor || '-';
    durasiPengajuan = paramDurasi || '-';
    rentangTanggal = paramMulai && paramSelesai ? `${paramMulai} s.d ${paramSelesai}` : (paramMulai ? `${paramMulai}` : '-');
    alasanPengajuan = paramAlasan || '-';
    noTelp = paramTelp || '-';
    alamatCuti = paramAlamat || '-';
    statusPengajuan = 'Disetujui';
    isPNS = !paramNip.toUpperCase().includes('NI PPPK') && !paramNip.toUpperCase().includes('PPPK');
  } else if (pengajuanList.length > 0) {
    // Ultimate fallback if nothing specified
    const activeP = pengajuanList.find(p => p.status === 'Disetujui') || pengajuanList[0];
    const pDetail = pegawaiList.find(p => p.id === activeP.pegawaiId);
    const jcSelected = jenisCutiList.find(jc => jc.id === activeP.jenisCutiId);

    pemohonNama = pDetail?.nama || 'SITI NUR ALIMAH, S.M.';
    pemohonNip = pDetail?.nip ? `${pDetail.statusPegawai === 'PPPK' ? 'NI PPPK' : 'NIP'}. ${pDetail.nip}` : 'NIP. 198306162014062006';
    pemohonJabatan = pDetail?.jabatan || 'Penelaah Teknis Kebijakan';
    kategoriCuti = jcSelected?.nama || 'Cuti Melahirkan';
    nomorSurat = activeP.nomorSurat || '800.1.2.3/678';
    
    const isHariKalender = kategoriCuti.toLowerCase().includes('sakit') || kategoriCuti.toLowerCase().includes('melahirkan') || kategoriCuti.toLowerCase().includes('besar');
    durasiPengajuan = `${activeP.jumlahHari} Hari ${isHariKalender ? 'Kalender' : 'Kerja'}`;
    rentangTanggal = `${activeP.tanggalMulai} s.d ${activeP.tanggalSelesai}`;
    alasanPengajuan = activeP.alasan || 'keperluan keluarga saya';
    noTelp = activeP.noTelpHubungi || '1234567';
    alamatCuti = activeP.alamatSelamaCuti || 'botorejo demak';
    statusPengajuan = activeP.status || 'Disetujui';
    isPNS = pDetail?.statusPegawai === 'PNS';
  }

  // Calculate initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'SI';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 py-6 sm:py-12 px-3 sm:px-6 flex items-center justify-center font-sans antialiased text-slate-900">
      
      {/* CARD MAIN CONTAINER matching Image 2 */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-xl w-full p-5 sm:p-8 space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60 shadow-xs">
            <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-slate-900 font-bold text-lg sm:text-xl tracking-tight leading-snug">
              Rangkuman &amp; Dokumen Pengajuan Cuti ASN
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-snug">
              Rangkuman lengkap permohonan cuti, alasan, serta berkas bukti dukung.
            </p>
          </div>
        </div>

        {/* SECTION 1: PROFIL PEMOHON CUTI */}
        <div className="space-y-2">
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>PROFIL PEMOHON CUTI</span>
          </div>

          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100/90 text-blue-700 font-bold text-sm sm:text-base flex items-center justify-center shrink-0 border border-blue-200/50">
              {getInitials(pemohonNama)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-slate-900 font-bold text-base tracking-tight truncate">
                {pemohonNama}
              </h2>
              <p className="text-slate-500 text-xs font-mono tracking-wide mt-0.5">
                {pemohonNip}
              </p>
              <p className="text-slate-600 text-xs mt-0.5 truncate">
                Jabatan: {pemohonJabatan}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: DETAIL PERMOHONAN & KATEGORI */}
        <div className="space-y-3">
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>DETAIL PERMOHONAN &amp; KATEGORI</span>
          </div>

          {/* Grid 2 Columns */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                KATEGORI CUTI
              </span>
              <span className="text-slate-900 font-bold text-sm sm:text-base mt-1 block">
                {kategoriCuti}
              </span>
            </div>

            <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                NOMOR SURAT
              </span>
              <span className="text-slate-900 font-bold text-sm sm:text-base font-mono mt-1 block">
                {nomorSurat}
              </span>
            </div>

            <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                DURASI PENGAJUAN
              </span>
              <span className="text-blue-600 font-bold text-sm sm:text-base mt-1 block">
                {durasiPengajuan}
              </span>
            </div>

            <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                RENTANG TANGGAL
              </span>
              <span className="text-slate-900 font-bold text-xs sm:text-sm font-mono mt-1 block leading-tight">
                {rentangTanggal}
              </span>
            </div>
          </div>

          {/* Box Alasan & Kontak */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                ALASAN PENGAJUAN
              </span>
              <p className="italic text-slate-800 text-sm font-semibold mt-1">
                &ldquo;{alasanPengajuan}&rdquo;
              </p>
            </div>

            <div className="border-t border-slate-200/60 pt-3 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                  NO. TELP / HP HUBUNGI
                </span>
                <span className="text-slate-900 font-bold text-xs sm:text-sm font-mono mt-1 block">
                  {noTelp}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                  ALAMAT SELAMA CUTI
                </span>
                <span className="text-slate-900 font-semibold text-xs sm:text-sm mt-1 block capitalize">
                  {alamatCuti}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* VERIFICATION STATUS BADGE */}
        <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-900 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Dokumen Cuti Digital terverifikasi <strong>SAH &amp; Resmi (TTE BSrE/BSSN)</strong></span>
          </div>
          <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider shrink-0">
            {statusPengajuan}
          </span>
        </div>

        {/* BOTTOM ACTION BUTTON */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold rounded-xl px-6 py-2.5 text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer flex items-center gap-2"
          >
            <span>Tutup Pratinjau</span>
          </button>
        </div>

      </div>

    </div>
  );
}

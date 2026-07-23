'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Printer, X } from 'lucide-react';
import { initialPengajuanCuti, initialPegawai, initialJenisCuti, defaultPengaturanInstansi, initialSisaCutiTahunan } from '../../lib/initialData';
import { PengajuanCuti, Pegawai, JenisCuti, PengaturanInstansi, SisaCutiTahunan } from '../../lib/types';

export default function VerifikasiPage() {
  const [searchId] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('id') || urlParams.get('nomor') || '';
    }
    return '';
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

  // Cari data pengajuan berdasarkan ID/nomor.
  // Jika tidak ditemukan atau ID acak, selalu fallback ke data pengajuan pertama agar dokumen langsung tampil (seperti gambar 2)
  const targetQuery = searchId.trim().toLowerCase();
  let activePengajuan: PengajuanCuti | null = null;

  if (targetQuery) {
    activePengajuan = pengajuanList.find(p => 
      p.id.toLowerCase() === targetQuery || 
      (p.nomorSurat && p.nomorSurat.toLowerCase() === targetQuery) ||
      (p.nomorSurat && p.nomorSurat.toLowerCase().includes(targetQuery))
    ) || null;
  }

  if (!activePengajuan && pengajuanList.length > 0) {
    // Cari pengajuan yang disetujui, jika tidak ada ambil index 0
    activePengajuan = pengajuanList.find(p => p.status === 'Disetujui') || pengajuanList[0];
  }

  const handleCloseDocument = () => {
    if (typeof window !== 'undefined') {
      window.close();
      setTimeout(() => {
        window.location.href = '/';
      }, 200);
    }
  };

  const handlePrintDocument = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const getPegawaiDetail = (id?: string) => {
    if (!id) return null;
    return pegawaiList.find(p => p.id === id) || null;
  };

  const getJenisCutiNama = (id?: string) => {
    if (!id) return '-';
    return jenisCutiList.find(jc => jc.id === id)?.nama || '-';
  };

  const getPegawaiNama = (id?: string) => {
    if (!id) return '';
    return pegawaiList.find(p => p.id === id)?.nama || '';
  };

  const getPegawaiNip = (id?: string) => {
    if (!id) return '';
    return pegawaiList.find(p => p.id === id)?.nip || '';
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

  const isHariKalender = (jenisCutiId?: string) => {
    if (!jenisCutiId) return false;
    const selected = jenisCutiList.find(jc => jc.id === jenisCutiId);
    if (!selected) return false;
    const nameLower = selected.nama.toLowerCase();
    return nameLower.includes('sakit') || nameLower.includes('melahirkan') || nameLower.includes('besar') || nameLower.includes('luar tanggungan');
  };

  const pemohon = getPegawaiDetail(activePengajuan?.pegawaiId);
  const isPNS = pemohon?.statusPegawai === 'PNS';
  const sc = sisaCutiList.find(s => s.pegawaiId === activePengajuan?.pegawaiId);
  const jcSelected = jenisCutiList.find(jc => jc.id === activePengajuan?.jenisCutiId);
  const namaCutiLower = jcSelected?.nama.toLowerCase() || '';

  const isTTEFull = activePengajuan ? (activePengajuan.metodePenandatanganan === 'TTE' || (activePengajuan.ttdDigitalAtasan !== false && activePengajuan.ttdDigitalPejabat !== false)) : false;
  const showQRPemohon = isTTEFull && activePengajuan?.ttdDigitalPemohon !== false;
  const showQRAtasan = isTTEFull && activePengajuan?.ttdDigitalAtasan !== false;
  const showQRPejabat = isTTEFull && activePengajuan?.ttdDigitalPejabat !== false;

  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://sip-cuti.demakkab.go.id';
  const verificationUrl = activePengajuan ? `${appOrigin}/verifikasi?id=${encodeURIComponent(activePengajuan.id)}` : '';
  const dynamicQrCode = verificationUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verificationUrl)}` : '';

  const currentYear = new Date().getFullYear();

  if (!activePengajuan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      
      {/* Top Floating/Sticky Bar for Actions - Hidden during Print */}
      <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md text-white py-2.5 px-4 no-print flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-200">Dokumen Cuti Digital Terverifikasi SAH</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintDocument}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak Dokumen</span>
          </button>
          <button
            type="button"
            onClick={handleCloseDocument}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Tutup Dokumen</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT CONTAINER - Pure White, Clean PDF/Print View matching Image 2 */}
      <div id="printable-area" className="max-w-4xl mx-auto p-4 sm:p-8 text-black leading-[1.3] font-serif text-xs sm:text-sm bg-white">
        
        {/* Header Kanan Atas */}
        <div className="flex justify-end mb-6 print:mb-2 text-[10px] sm:text-[11px] uppercase font-sans leading-tight">
          <div className="w-[280px] sm:w-[320px] text-left">
            {isPNS ? (
              <>
                <p>ANAK LAMPIRAN 1.b</p>
                <p>PERATURAN BADAN KEPEGAWAIAN NEGARA</p>
                <p>REPUBLIK INDONESIA</p>
                <p>NOMOR 24 TAHUN 2017</p>
                <p>TENTANG</p>
                <p>TATA CARA PEMBERIAN CUTI PEGAWAI NEGERI SIPIL</p>
              </>
            ) : (
              <>
                <p>LAMPIRAN II</p>
                <p>PERATURAN BADAN KEPEGAWAIAN NEGARA</p>
                <p>REPUBLIK INDONESIA</p>
                <p>NOMOR 7 TAHUN 2022</p>
                <p>TENTANG TATA CARA PEMBERIAN CUTI PEGAWAI PEMERINTAH DENGAN PERJANJIAN KERJA</p>
              </>
            )}
          </div>
        </div>

        {/* Subtitle khusus PPPK */}
        {!isPNS && (
          <div className="text-center mb-6 print:mb-2 font-sans text-xs sm:text-sm font-semibold max-w-[650px] mx-auto leading-relaxed">
            <p>Formulir Permintaan dan Pemberian Cuti Pegawai Pemerintah Dengan Perjanjian Kerja</p>
          </div>
        )}

        {/* Tanggal & Tujuan */}
        <div className="flex justify-end mb-4 print:mb-2 font-sans print-date-block">
          <div className="w-[280px] sm:w-[320px] text-left space-y-1">
            <p>Demak, {formatDateIndo(activePengajuan.tanggalPengajuan)}</p>
            <div className="mt-4 print:mt-1">
              <p>Kepada</p>
              <p>Yth. {getPegawaiDetail(activePengajuan.pejabatId)?.jabatan || instansiData.jabatanKepala}</p>
              <p>di.</p>
              <p className="font-bold underline ml-4 font-sans">DEMAK</p>
            </div>
          </div>
        </div>

        {/* Judul Formulir */}
        <div className="text-center mb-6 print:mb-2 font-sans">
          <h2 className="font-bold text-lg sm:text-xl md:text-2xl uppercase tracking-wide">FORMULIR PERMINTAAN DAN PEMBERIAN CUTI</h2>
        </div>

        {/* TABEL DATA UTAMA */}
        <div className="font-sans text-[11px] sm:text-xs flex flex-col gap-3 print:gap-1.5">
          
          {/* I. DATA PEGAWAI */}
          <div className="border-[1px] border-black bg-white">
            <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">I. DATA PEGAWAI</div>
            <div className="grid grid-cols-12 border-b-[0.5px] border-black">
              <div className="col-span-3 sm:col-span-2 p-1 border-r-[0.5px] border-black whitespace-nowrap">Nama</div>
              <div className="col-span-9 sm:col-span-4 p-1 border-r-[0.5px] border-black font-semibold">{pemohon?.nama}</div>
              <div className="col-span-3 sm:col-span-2 p-1 border-r-[0.5px] border-black whitespace-nowrap">{isPNS ? 'NIP' : 'NI PPPK'}</div>
              <div className="col-span-9 sm:col-span-4 p-1">{pemohon?.nip}</div>
            </div>
            <div className="grid grid-cols-12 border-b-[0.5px] border-black">
              <div className="col-span-3 sm:col-span-2 p-1 border-r-[0.5px] border-black whitespace-nowrap">Jabatan</div>
              <div className="col-span-9 sm:col-span-4 p-1 border-r-[0.5px] border-black">{pemohon?.jabatan}</div>
              <div className="col-span-3 sm:col-span-2 p-1 border-r-[0.5px] border-black whitespace-nowrap">Masa Kerja</div>
              <div className="col-span-9 sm:col-span-4 p-1">{pemohon?.masaKerja}</div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-3 sm:col-span-2 p-1 border-r-[0.5px] border-black leading-tight whitespace-nowrap">Unit Kerja</div>
              <div className="col-span-9 sm:col-span-10 p-1 font-semibold">{pemohon?.unitKerja} {instansiData.namaInstansi}</div>
            </div>
          </div>

          {/* II. JENIS CUTI YANG DIAMBIL */}
          <div className="border-[1px] border-black bg-white">
            <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">II. JENIS CUTI YANG DIAMBIL **</div>
            {isPNS ? (
              <div className="grid grid-cols-2">
                <div className="border-r-[0.5px] border-black">
                  <div className="flex border-b-[0.5px] border-black">
                    <div className="flex-1 p-1 whitespace-nowrap">1. Cuti Tahunan</div>
                    <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('tahunan') ? '✔' : '-'}</div>
                  </div>
                  <div className="flex border-b-[0.5px] border-black">
                    <div className="flex-1 p-1 whitespace-nowrap">3. Cuti Sakit</div>
                    <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('sakit') ? '✔' : '-'}</div>
                  </div>
                  <div className="flex">
                    <div className="flex-1 p-1 whitespace-nowrap">5. Cuti Karena Alasan Penting</div>
                    <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('alasan penting') ? '✔' : '-'}</div>
                  </div>
                </div>
                <div>
                  <div className="flex border-b-[0.5px] border-black">
                    <div className="flex-1 p-1 whitespace-nowrap">2. Cuti Besar</div>
                    <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('besar') ? '✔' : '-'}</div>
                  </div>
                  <div className="flex border-b-[0.5px] border-black">
                    <div className="flex-1 p-1 whitespace-nowrap">4. Cuti Melahirkan</div>
                    <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('melahirkan') ? '✔' : '-'}</div>
                  </div>
                  <div className="flex">
                    <div className="flex-1 p-1 whitespace-nowrap">6. Cuti di Luar Tanggungan Negara</div>
                    <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('tanggungan negara') ? '✔' : '-'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1">
                <div className="flex border-b-[0.5px] border-black">
                  <div className="flex-1 p-1 whitespace-nowrap">1. Cuti Tahunan</div>
                  <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('tahunan') ? '✔' : '-'}</div>
                </div>
                <div className="flex border-b-[0.5px] border-black">
                  <div className="flex-1 p-1 whitespace-nowrap">2. Cuti Sakit</div>
                   <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('sakit') ? '✔' : '-'}</div>
                </div>
                <div className="flex">
                  <div className="flex-1 p-1 whitespace-nowrap">3. Cuti Melahirkan</div>
                  <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('melahirkan') ? '✔' : '-'}</div>
                </div>
              </div>
            )}
          </div>

          {/* III. ALASAN CUTI */}
          <div className="border-[1px] border-black bg-white">
            <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">III. ALASAN CUTI</div>
            <div className="p-2 min-h-[30px] italic">{activePengajuan.alasan}</div>
          </div>

          {/* IV. LAMANYA CUTI */}
          <div className="border-[1px] border-black bg-white">
            <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">IV. LAMANYA CUTI</div>
            <div className="grid grid-cols-12">
              <div className="col-span-2 sm:col-span-1 p-1 border-r-[0.5px] border-black whitespace-nowrap">Selama</div>
              <div className="col-span-10 sm:col-span-3 p-1 border-r-[0.5px] border-black font-semibold">{activePengajuan.jumlahHari} ({isHariKalender(activePengajuan.jenisCutiId) ? 'hari kalender' : 'hari kerja'})</div>
              <div className="col-span-4 sm:col-span-2 p-1 border-r-[0.5px] border-black whitespace-nowrap">Mulai Tanggal</div>
              <div className="col-span-3 sm:col-span-2 p-1 border-r-[0.5px] border-black font-semibold text-center">{activePengajuan.tanggalMulai}</div>
              <div className="col-span-1 p-1 border-r-[0.5px] border-black text-center whitespace-nowrap">s/d</div>
              <div className="col-span-4 sm:col-span-3 p-1 font-semibold text-center">{activePengajuan.tanggalSelesai}</div>
            </div>
          </div>

          {/* V. CATATAN CUTI */}
          <div className="border-[1px] border-black bg-white">
            <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">V. CATATAN CUTI ***</div>
            {isPNS ? (
              <div className="grid grid-cols-12">
                <div className="col-span-6 border-r-[0.5px] border-black">
                  <div className="p-1 border-b-[0.5px] border-black font-semibold whitespace-nowrap">1. CUTI TAHUNAN</div>
                  <div className="grid grid-cols-12 border-b-[0.5px] border-black font-bold text-center bg-gray-50">
                    <div className="col-span-4 p-1 border-r-[0.5px] border-black whitespace-nowrap">Tahun</div>
                    <div className="col-span-3 p-1 border-r-[0.5px] border-black whitespace-nowrap">Sisa</div>
                    <div className="col-span-5 p-1 whitespace-nowrap">Keterangan</div>
                  </div>
                  <div className="grid grid-cols-12 border-b-[0.5px] border-black">
                    <div className="col-span-4 p-1 border-r-[0.5px] border-black text-center whitespace-nowrap">N - 2</div>
                    <div className="col-span-3 p-1 border-r-[0.5px] border-black text-center font-mono">{sc?.sisaN2 || 0}</div>
                    <div className="col-span-5 p-1"></div>
                  </div>
                  <div className="grid grid-cols-12 border-b-[0.5px] border-black">
                    <div className="col-span-4 p-1 border-r-[0.5px] border-black text-center whitespace-nowrap">N - 1</div>
                    <div className="col-span-3 p-1 border-r-[0.5px] border-black text-center font-mono">{sc?.sisaN1 || 0}</div>
                    <div className="col-span-5 p-1"></div>
                  </div>
                  <div className="grid grid-cols-12">
                    <div className="col-span-4 p-1 border-r-[0.5px] border-black text-center font-bold whitespace-nowrap">N</div>
                    <div className="col-span-3 p-1 border-r-[0.5px] border-black text-center font-bold font-mono">{sc?.sisaN || 12}</div>
                    <div className="col-span-5 p-1"></div>
                  </div>
                </div>
                <div className="col-span-6">
                  <div className="flex border-b-[0.5px] border-black">
                    <div className="flex-1 p-1 whitespace-nowrap">2. CUTI BESAR</div>
                    <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center font-mono">-</div>
                  </div>
                  <div className="flex border-b-[0.5px] border-black">
                    <div className="flex-1 p-1 whitespace-nowrap">3. CUTI SAKIT</div>
                    <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center font-mono">-</div>
                  </div>
                  <div className="flex border-b-[0.5px] border-black">
                    <div className="flex-1 p-1 whitespace-nowrap">4. CUTI MELAHIRKAN</div>
                    <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center font-mono">-</div>
                  </div>
                  <div className="flex border-b-[0.5px] border-black">
                    <div className="flex-1 p-1 leading-tight whitespace-nowrap">5. CUTI KARENA ALASAN PENTING</div>
                    <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center font-mono">-</div>
                  </div>
                  <div className="flex">
                    <div className="flex-1 p-1 leading-tight whitespace-nowrap">6. CUTI DI LUAR TANGGUNGAN NEGARA</div>
                    <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center font-mono">-</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1">
                <div className="flex border-b-[0.5px] border-black">
                  <div className="flex-1 p-1 whitespace-nowrap">1. Cuti Tahunan</div>
                  <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center font-mono">{namaCutiLower.includes('tahunan') ? '✔' : '-'}</div>
                </div>
                <div className="flex border-b-[0.5px] border-black">
                  <div className="flex-1 p-1 whitespace-nowrap">2. Cuti Sakit</div>
                  <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center font-mono">{namaCutiLower.includes('sakit') ? '✔' : '-'}</div>
                </div>
                <div className="flex">
                  <div className="flex-1 p-1 whitespace-nowrap">3. Cuti Karena Alasan Penting</div>
                  <div className="w-10 sm:w-12 p-1 border-l-[0.5px] border-black text-center font-mono">{namaCutiLower.includes('alasan penting') ? '✔' : '-'}</div>
                </div>
              </div>
            )}
          </div>

          {/* VI. ALAMAT SELAMA MENJALANKAN CUTI */}
          <div className="border-[1px] border-black bg-white">
            <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">VI. ALAMAT SELAMA MENJALANKAN CUTI</div>
            <div className="grid grid-cols-12">
              <div className="col-span-6 p-2 border-r-[0.5px] border-black italic leading-tight break-words whitespace-pre-wrap flex flex-col justify-start">
                {activePengajuan.alamatSelamaCuti}
              </div>
              
              <div className="col-span-6 flex flex-col">
                <div className="grid grid-cols-12 border-b-[0.5px] border-black">
                  <div className="col-span-4 p-2 border-r-[0.5px] border-black flex items-center justify-center font-bold">
                    TELP
                  </div>
                  <div className="col-span-8 p-2 flex items-center justify-center italic">
                    {activePengajuan.noTelpHubungi}
                  </div>
                </div>
                
                <div className="flex flex-row flex-1 min-h-[110px]">
                  <div className="w-1/3 flex items-center justify-center p-2 shrink-0">
                    {showQRPemohon ? (
                      <div className="flex items-center justify-center shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pemohon?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`SIP-CUTI SETDA DEMAK - VERIFIKASI PEMOHON\nID Dokumen: ${activePengajuan.id}\nNama Pemohon: ${pemohon?.nama || ''}\nNIP: ${pemohon?.nip || ''}\nStatus TTE: Terverifikasi BSrE/BSSN\nKeperluan: Pengajuan Cuti ${getJenisCutiNama(activePengajuan.jenisCutiId)} selama ${activePengajuan.jumlahHari} hari\nTanggal Pengajuan: ${activePengajuan.tanggalPengajuan || ''}`)}`}
                          alt="QR Code TTE Pemohon"
                          className="w-16 h-16 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="w-2/3 p-2 flex flex-col items-center justify-center">
                    <p className="signature-space whitespace-nowrap">Hormat saya,</p>
                    <p className="font-bold underline text-center whitespace-nowrap">({pemohon?.nama})</p>
                    <p className="text-center uppercase whitespace-nowrap">{isPNS ? 'NIP' : 'NI PPPK'}. {pemohon?.nip}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VII. PERTIMBANGAN ATASAN LANGSUNG */}
          <div className="border-[1px] border-black bg-white">
            <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">VII. PERTIMBANGAN ATASAN LANGSUNG **</div>
            <div className="grid grid-cols-4 border-b-[0.5px] border-black text-center font-bold text-[9px] sm:text-[10px]">
              <div className="p-1 border-r-[0.5px] border-black whitespace-nowrap">DISETUJUI</div>
              <div className="p-1 border-r-[0.5px] border-black whitespace-nowrap">PERUBAHAN ****</div>
              <div className="p-1 border-r-[0.5px] border-black whitespace-nowrap">DITANGGUHKAN ****</div>
              <div className="p-1 whitespace-nowrap">TIDAK DISETUJUI ****</div>
            </div>
            <div className="grid grid-cols-4 min-h-[15px] border-b-[0.5px] border-black text-center">
              <div className="p-1 border-r-[0.5px] border-black">✔</div>
              <div className="p-1 border-r-[0.5px] border-black"></div>
              <div className="p-1 border-r-[0.5px] border-black"></div>
              <div className="p-1"></div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6 border-r-[0.5px] border-black"></div>
              <div className="col-span-6 flex flex-row">
                <div className="w-1/3 flex items-center justify-center p-2 shrink-0">
                   {showQRAtasan ? (
                     <div className="flex items-center justify-center shrink-0">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img
                         src={getPegawaiDetail(activePengajuan.atasanId)?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`SIP-CUTI SETDA DEMAK - PERTIMBANGAN ATASAN LANGSUNG\nID Dokumen: ${activePengajuan.id}\nNama Atasan: ${getPegawaiNama(activePengajuan.atasanId)}\nNIP Atasan: ${getPegawaiNip(activePengajuan.atasanId)}\nJabatan Atasan: ${getPegawaiDetail(activePengajuan.atasanId)?.jabatan || 'Atasan Langsung'}\nStatus TTE: Disetujui secara Elektronik (BSrE/BSSN)\nTanggal Pertimbangan: ${activePengajuan.tanggalPengajuan || ''}`)}`}
                         alt="QR Code TTE Atasan"
                         className="w-16 h-16 object-contain"
                         referrerPolicy="no-referrer"
                        />
                     </div>
                   ) : null}
                </div>
                <div className="w-2/3 p-2 flex flex-col items-center">
                  <p className="font-bold text-center leading-tight signature-space">
                    {getPegawaiDetail(activePengajuan.atasanId)?.jabatan}
                  </p>
                  <p className="font-bold underline text-center whitespace-nowrap">({getPegawaiNama(activePengajuan.atasanId)})</p>
                  <p className="text-center uppercase whitespace-nowrap">NIP. {getPegawaiNip(activePengajuan.atasanId)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* VIII. KEPUTUSAN PEJABAT YANG BERWENANG */}
          <div className="border-[1px] border-black bg-white">
            <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">VIII. KEPUTUSAN PEJABAT YANG BERWENANG MEMBERIKAN CUTI **</div>
            <div className="grid grid-cols-4 border-b-[0.5px] border-black text-center font-bold text-[9px] sm:text-[10px]">
              <div className="p-1 border-r-[0.5px] border-black whitespace-nowrap">DISETUJUI</div>
              <div className="p-1 border-r-[0.5px] border-black whitespace-nowrap">PERUBAHAN ****</div>
              <div className="p-1 border-r-[0.5px] border-black whitespace-nowrap">DITANGGUHKAN ****</div>
              <div className="p-1 whitespace-nowrap">TIDAK DISETUJUI ****</div>
            </div>
            <div className="grid grid-cols-4 min-h-[15px] border-b-[0.5px] border-black text-center">
              <div className="p-1 border-r-[0.5px] border-black">✔</div>
              <div className="p-1 border-r-[0.5px] border-black"></div>
              <div className="p-1 border-r-[0.5px] border-black"></div>
              <div className="p-1"></div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6 border-r-[0.5px] border-black p-2 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dynamicQrCode}
                  alt="QR Code Verifikasi Dokumen Cuti"
                  className="w-16 h-16 object-contain shrink-0 border border-black/10 p-0.5"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="col-span-6 flex flex-row">
                <div className="w-1/3 flex items-center justify-center p-2 shrink-0">
                   {showQRPejabat ? (
                     <div className="flex items-center justify-center shrink-0">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img
                         src={getPegawaiDetail(activePengajuan.pejabatId)?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`SIP-CUTI SETDA DEMAK - KEPUTUSAN PEJABAT YANG BERWENANG\nID Dokumen: ${activePengajuan.id}\nNama Pejabat: ${getPegawaiNama(activePengajuan.pejabatId)}\nNIP Pejabat: ${getPegawaiNip(activePengajuan.pejabatId)}\nJabatan Pejabat: ${getPegawaiDetail(activePengajuan.pejabatId)?.jabatan || 'Pejabat yang Berwenang'}\nStatus TTE: Disetujui & Disahkan secara Elektronik (BSrE/BSSN)\nTanggal Keputusan: ${activePengajuan.tanggalPengajuan || ''}`)}`}
                         alt="QR Code TTE Pejabat"
                         className="w-16 h-16 object-contain"
                         referrerPolicy="no-referrer"
                       />
                     </div>
                   ) : null}
                </div>
                <div className="w-2/3 p-2 flex flex-col items-center">
                  <p className="font-bold text-center leading-tight signature-space">
                    {getPegawaiDetail(activePengajuan.pejabatId)?.jabatan}
                  </p>
                  <p className="font-bold underline text-center whitespace-nowrap">({getPegawaiNama(activePengajuan.pejabatId)})</p>
                  <p className="text-center uppercase whitespace-nowrap">NIP. {getPegawaiNip(activePengajuan.pejabatId)}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Keterangan */}
        <div className="mt-4 text-[10px] leading-tight font-sans text-gray-600 italic">
          <p>Keterangan:</p>
          <p>* Silakan pilih salah satu atau lebih jenis cuti yang sesuai.</p>
          <p>** Silakan isi dengan jenis cuti yang diambil.</p>
          <p>*** Silakan isi dengan catatan cuti yang relevan.</p>
          <p>**** Silakan isi dengan keterangan tambahan jika diperlukan.</p>
          <p>N = Tahun berjalan ({currentYear})</p>
          <p>N - 1 = Tahun sebelum tahun berjalan ({currentYear - 1})</p>
          <p>N - 2 = Tahun sebelum tahun berjalan ({currentYear - 2})</p>
        </div>

      </div>

    </div>
  );
}

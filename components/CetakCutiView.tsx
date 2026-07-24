'use client';

/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import { Search, Printer, X, FileCheck, CheckSquare, Square } from 'lucide-react';
import { PengajuanCuti, Pegawai, JenisCuti, SisaCutiTahunan, PengaturanInstansi } from '../lib/types';

interface CetakCutiViewProps {
  pengajuan: PengajuanCuti[];
  pegawai: Pegawai[];
  jenisCuti: JenisCuti[];
  sisaCuti: SisaCutiTahunan[];
  instansi: PengaturanInstansi;
  currentUser?: { role: string; pegawaiId?: string; } | null;
}

export default function CetakCutiView({ pengajuan, pegawai, jenisCuti, sisaCuti, instansi, currentUser }: CetakCutiViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrint, setSelectedPrint] = useState<PengajuanCuti | null>(null);

  const getPegawaiNama = (id: string) => pegawai.find(p => p.id === id)?.nama || '';
  const getPegawaiDetail = (id: string) => pegawai.find(p => p.id === id);
  const getJenisCutiNama = (id: string) => jenisCuti.find(jc => jc.id === id)?.nama || '';
  const getPegawaiNip = (id: string) => pegawai.find(p => p.id === id)?.nip || '';

  const isHariKalender = (jenisCutiId: string) => {
    const selected = jenisCuti.find(jc => jc.id === jenisCutiId);
    if (!selected) return false;
    const nameLower = selected.nama.toLowerCase();
    return nameLower.includes('sakit') || nameLower.includes('melahirkan') || nameLower.includes('besar') || nameLower.includes('luar tanggungan');
  };

  // Filter hanya yang berstatus "Disetujui" karena hanya yang disetujui yang dapat dicetak form resminya
  const disetujuiPengajuan = pengajuan.filter(pj => {
    if (pj.status !== 'Disetujui') return false;
    
    const p = getPegawaiDetail(pj.pegawaiId);
    if (!p) return false;
    
    const s = searchTerm.toLowerCase();
    return p.nama.toLowerCase().includes(s) || 
           p.nip.includes(s) || 
           getJenisCutiNama(pj.jenisCutiId).toLowerCase().includes(s) ||
           pj.nomorSurat.toLowerCase().includes(s);
  });

  const handlePrintDocument = () => {
    window.print();
  };

  // Format tanggal Indonesia
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

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* List Cetak (no-print) */}
      <div className={`space-y-6 ${selectedPrint ? 'no-print hidden md:block' : ''}`}>
        <div>
          <h3 className="text-base font-bold text-gray-800">Cetak Formulir Cuti ASN Resmi</h3>
          <p className="text-xs text-gray-500">Pilih pengajuan cuti pegawai yang telah disetujui di bawah ini untuk menampilkan dan mencetak lembar formulir cuti format resmi BKN.</p>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama pemohon atau nomor surat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <span className="text-xs text-gray-400 font-mono">Hanya menampilkan pengajuan berstatus &quot;DISETUJUI&quot;</span>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <th className="p-4">No</th>
                  <th className="p-4">Nomor Berkas / Surat</th>
                  <th className="p-4">Nama Pegawai ASN</th>
                  <th className="p-4">Jenis Cuti</th>
                  <th className="p-4">Masa Cuti (Durasi)</th>
                  <th className="p-4 text-center">Formulir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {disetujuiPengajuan.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      Tidak ada pengajuan cuti disetujui yang siap dicetak.
                    </td>
                  </tr>
                ) : (
                  disetujuiPengajuan.map((pj, idx) => (
                    <tr key={pj.id} className="hover:bg-gray-50/50 transition-all">
                      <td className="p-4 font-mono text-gray-400">{idx + 1}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{pj.nomorSurat}</div>
                        <div className="text-xs text-gray-400">Pengajuan: {pj.tanggalPengajuan}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-950">{getPegawaiNama(pj.pegawaiId)}</div>
                        <div className="text-xs text-gray-400 font-mono">NIP. {getPegawaiNip(pj.pegawaiId)}</div>
                      </td>
                      <td className="p-4 font-semibold">{getJenisCutiNama(pj.jenisCutiId)}</td>
                      <td className="p-4">
                        <div className="font-semibold text-blue-700">
                          {pj.jumlahHari} {isHariKalender(pj.jenisCutiId) ? 'Hari Kalender' : 'Hari Kerja'}
                        </div>
                        <div className="text-xs text-gray-400">{pj.tanggalMulai} s.d {pj.tanggalSelesai}</div>
                      </td>
                      <td className="p-4 text-center">
                        {(() => {
                          let canPrint = false;
                          if (currentUser?.role === 'Admin') canPrint = true;
                          if (currentUser?.role === 'Operator') {
                            if (currentUser.pegawaiId) {
                              const currentUserPegawai = pegawai.find(p => p.id === currentUser.pegawaiId);
                              const pjPegawai = pegawai.find(p => p.id === pj.pegawaiId);
                              if (currentUserPegawai && pjPegawai && currentUserPegawai.unitKerja === pjPegawai.unitKerja) {
                                canPrint = true;
                              }
                            } else {
                              canPrint = true;
                            }
                          }

                          if (!canPrint) return <span className="text-xs text-gray-400 font-mono italic">Tidak Ada Akses</span>;

                          return (
                            <button
                              id={`btn-buka-cetak-${pj.id}`}
                              onClick={() => {
                                setSelectedPrint(pj);
                              }}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-sm font-bold transition-all inline-flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Buka Lembar Cetak</span>
                            </button>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL PRINT PREVIEW RESMI BKN (Aktif saat selectedPrint terisi) */}
      {selectedPrint && (() => {
        const pDetail = getPegawaiDetail(selectedPrint.pegawaiId);
        const isPNS = pDetail?.statusPegawai === 'PNS';
        const sc = sisaCuti.find(s => s.pegawaiId === selectedPrint.pegawaiId);
        const jcSelected = jenisCuti.find(jc => jc.id === selectedPrint.jenisCutiId);
        const namaCutiLower = jcSelected?.nama.toLowerCase() || '';

        // Tanda Tangan Elektronik / QR Code otomatis berdasarkan ketentuan pengajuan cuti
        const isTTEFull = selectedPrint.metodePenandatanganan === 'TTE' || (selectedPrint.ttdDigitalAtasan !== false && selectedPrint.ttdDigitalPejabat !== false);
        const showQRPemohon = isTTEFull && selectedPrint.ttdDigitalPemohon !== false;
        const showQRAtasan = isTTEFull && selectedPrint.ttdDigitalAtasan !== false;
        const showQRPejabat = isTTEFull && selectedPrint.ttdDigitalPejabat !== false;

        const isHariKalender = namaCutiLower.includes('sakit') || namaCutiLower.includes('melahirkan') || namaCutiLower.includes('besar');
        const durasiText = `${selectedPrint.jumlahHari} Hari ${isHariKalender ? 'Kalender' : 'Kerja'}`;
        const queryParams = new URLSearchParams({
          id: selectedPrint.id,
          no: selectedPrint.nomorSurat || '',
          nm: pDetail?.nama || '',
          nip: pDetail?.nip || '',
          j: pDetail?.jabatan || '',
          cat: jcSelected?.nama || 'Cuti Tahunan',
          dur: durasiText,
          m: selectedPrint.tanggalMulai || '',
          s: selectedPrint.tanggalSelesai || '',
          als: selectedPrint.alasan || '',
          tlp: selectedPrint.noTelpHubungi || pDetail?.noHp || '',
          alm: selectedPrint.alamatSelamaCuti || ''
        }).toString();

        const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://sip-cuti.demakkab.go.id';
        const verificationUrl = `${appOrigin}/verifikasi?${queryParams}`;
        const dynamicQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&ecc=L&margin=1&data=${encodeURIComponent(verificationUrl)}`;

        return (
          <div className="fixed inset-0 bg-gray-100 md:bg-black/50 overflow-y-auto z-50 flex items-start justify-center p-0 md:p-6 transition-all">
            <div className="bg-white w-full max-w-[850px] shadow-2xl border-0 md:border border-gray-300 md:rounded-xl overflow-hidden flex flex-col my-0 md:my-4 print:my-0">
              
              {/* Toolbar Atas (No-print) */}
              <div className="p-4 bg-slate-900 text-white flex flex-col gap-3 no-print shrink-0 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="text-xs font-bold font-mono uppercase">Preview Formulir Cuti</h4>
                      <p className="text-[11px] text-blue-200">
                        {isPNS 
                          ? 'Format Anak Lampiran 1.b Peraturan BKN No. 24 Tahun 2017 (PNS)' 
                          : 'Format Lampiran II Peraturan BKN No. 7 Tahun 2022 (PPPK)'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-cetak-print-dialog"
                      onClick={handlePrintDocument}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Cetak Sekarang</span>
                    </button>
                    <button
                      id="btn-tutup-cetak"
                      onClick={() => setSelectedPrint(null)}
                      className="p-1.5 hover:bg-slate-800 text-white rounded transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status Ketentuan Penandatanganan (Otomatis tanpa checkbox) */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-800/80 px-3.5 py-2 rounded-lg border border-slate-750/50 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-semibold">Status Legalisasi Dokumen:</span>
                    {isTTEFull ? (
                      <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/40 rounded-md font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        FULL TTE QR CODE
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-md font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        TTD MANUAL / BASAH
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 italic">
                    {isTTEFull ? 'QR Code TTE otomatis terbit & aktif pada dokumen.' : 'Formulir dicetak tanpa QR Code untuk tanda tangan fisik.'}
                  </span>
                </div>
              </div>

              {/* AREA UTAMA FORMULIR CUTI RESMI (PRINTABLE CANVAS) */}
              <div id="printable-area" className="flex-1 bg-white p-[1.5cm] text-black leading-[1.3] font-serif text-sm overflow-y-auto print:p-0 print:m-0">
                
                {/* Header Kanan Atas */}
                <div className="flex justify-end mb-6 print:mb-2 text-[11px] uppercase font-sans leading-tight">
                  <div className="w-[300px] text-left">
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
                  <div className="text-center mb-6 print:mb-2 font-sans text-sm font-semibold max-w-[600px] mx-auto leading-relaxed">
                    <p>Formulir Permintaan dan Pemberian Cuti Pegawai Pemerintah Dengan Perjanjian Kerja</p>
                  </div>
                )}

                {/* Tanggal & Tujuan */}
                <div className="flex justify-end mb-4 print:mb-2 font-sans print-date-block">
                  <div className="w-[300px] text-left space-y-1">
                    <p>Demak, {formatDateIndo(selectedPrint.tanggalPengajuan)}</p>
                    <div className="mt-4 print:mt-1">
                      <p>Kepada</p>
                      <p>Yth. {getPegawaiDetail(selectedPrint.pejabatId)?.jabatan || instansi.jabatanKepala}</p>
                      <p>di.</p>
                      <p className="font-bold underline ml-4 font-sans">DEMAK</p>
                    </div>
                  </div>
                </div>

                {/* Judul Formulir */}
                <div className="text-center mb-6 print:mb-2 font-sans">
                  <h2 className="font-bold text-xl md:text-2xl uppercase tracking-wide">FORMULIR PERMINTAAN DAN PEMBERIAN CUTI</h2>
                </div>

                {/* TABEL DATA UTAMA */}
                <div className="font-sans text-xs flex flex-col gap-3 print:gap-1.5">
                  
                  {/* I. DATA PEGAWAI */}
                  <div className="border-[1px] border-black bg-white">
                    <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">I. DATA PEGAWAI</div>
                    <div className="grid grid-cols-12 border-b-[0.5px] border-black">
                      <div className="col-span-2 p-1 border-r-[0.5px] border-black whitespace-nowrap">Nama</div>
                      <div className="col-span-4 p-1 border-r-[0.5px] border-black font-semibold">{pDetail?.nama}</div>
                      <div className="col-span-2 p-1 border-r-[0.5px] border-black whitespace-nowrap">{isPNS ? 'NIP' : 'NI PPPK'}</div>
                      <div className="col-span-4 p-1">{pDetail?.nip}</div>
                    </div>
                    <div className="grid grid-cols-12 border-b-[0.5px] border-black">
                      <div className="col-span-2 p-1 border-r-[0.5px] border-black whitespace-nowrap">Jabatan</div>
                      <div className="col-span-4 p-1 border-r-[0.5px] border-black">{pDetail?.jabatan}</div>
                      <div className="col-span-2 p-1 border-r-[0.5px] border-black whitespace-nowrap">Masa Kerja</div>
                      <div className="col-span-4 p-1">{pDetail?.masaKerja}</div>
                    </div>
                    <div className="grid grid-cols-12">
                      <div className="col-span-2 p-1 border-r-[0.5px] border-black leading-tight whitespace-nowrap">Unit Kerja</div>
                      <div className="col-span-10 p-1 font-semibold">{pDetail?.unitKerja} {instansi.namaInstansi}</div>
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
                            <div className="w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('tahunan') ? '✔' : '-'}</div>
                          </div>
                          <div className="flex border-b-[0.5px] border-black">
                            <div className="flex-1 p-1 whitespace-nowrap">3. Cuti Sakit</div>
                            <div className="w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('sakit') ? '✔' : '-'}</div>
                          </div>
                          <div className="flex">
                            <div className="flex-1 p-1 whitespace-nowrap">5. Cuti Karena Alasan Penting</div>
                            <div className="w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('alasan penting') ? '✔' : '-'}</div>
                          </div>
                        </div>
                        <div>
                          <div className="flex border-b-[0.5px] border-black">
                            <div className="flex-1 p-1 whitespace-nowrap">2. Cuti Besar</div>
                            <div className="w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('besar') ? '✔' : '-'}</div>
                          </div>
                          <div className="flex border-b-[0.5px] border-black">
                            <div className="flex-1 p-1 whitespace-nowrap">4. Cuti Melahirkan</div>
                            <div className="w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('melahirkan') ? '✔' : '-'}</div>
                          </div>
                          <div className="flex">
                            <div className="flex-1 p-1 whitespace-nowrap">6. Cuti di Luar Tanggungan Negara</div>
                            <div className="w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('tanggungan negara') ? '✔' : '-'}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1">
                        <div className="flex border-b-[0.5px] border-black">
                          <div className="flex-1 p-1 whitespace-nowrap">1. Cuti Tahunan</div>
                          <div className="w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('tahunan') ? '✔' : '-'}</div>
                        </div>
                        <div className="flex border-b-[0.5px] border-black">
                          <div className="flex-1 p-1 whitespace-nowrap">2. Cuti Sakit</div>
                           <div className="w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('sakit') ? '✔' : '-'}</div>
                        </div>
                        <div className="flex">
                          <div className="flex-1 p-1 whitespace-nowrap">3. Cuti Melahirkan</div>
                          <div className="w-12 p-1 border-l-[0.5px] border-black text-center">{namaCutiLower.includes('melahirkan') ? '✔' : '-'}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* III. ALASAN CUTI */}
                  <div className="border-[1px] border-black bg-white">
                    <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">III. ALASAN CUTI</div>
                    <div className="p-2 min-h-[30px] italic">{selectedPrint.alasan}</div>
                  </div>

                  {/* IV. LAMANYA CUTI */}
                  <div className="border-[1px] border-black bg-white">
                    <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">IV. LAMANYA CUTI</div>
                    <div className="grid grid-cols-12">
                      <div className="col-span-1 p-1 border-r-[0.5px] border-black whitespace-nowrap">Selama</div>
                      <div className="col-span-3 p-1 border-r-[0.5px] border-black font-semibold">{selectedPrint.jumlahHari} ({isHariKalender ? 'hari kalender' : 'hari kerja'})</div>
                      <div className="col-span-2 p-1 border-r-[0.5px] border-black whitespace-nowrap">Mulai Tanggal</div>
                      <div className="col-span-2 p-1 border-r-[0.5px] border-black font-semibold text-center">{selectedPrint.tanggalMulai}</div>
                      <div className="col-span-1 p-1 border-r-[0.5px] border-black text-center whitespace-nowrap">s/d</div>
                      <div className="col-span-3 p-1 font-semibold text-center">{selectedPrint.tanggalSelesai}</div>
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
                            <div className="w-12 p-1 border-l-[0.5px] border-black text-center font-mono">-</div>
                          </div>
                          <div className="flex border-b-[0.5px] border-black">
                            <div className="flex-1 p-1 whitespace-nowrap">3. CUTI SAKIT</div>
                            <div className="w-12 p-1 border-l-[0.5px] border-black text-center font-mono">-</div>
                          </div>
                          <div className="flex border-b-[0.5px] border-black">
                            <div className="flex-1 p-1 whitespace-nowrap">4. CUTI MELAHIRKAN</div>
                            <div className="w-12 p-1 border-l-[0.5px] border-black text-center font-mono">-</div>
                          </div>
                          <div className="flex border-b-[0.5px] border-black">
                            <div className="flex-1 p-1 leading-tight whitespace-nowrap">5. CUTI KARENA ALASAN PENTING</div>
                            <div className="w-12 p-1 border-l-[0.5px] border-black text-center font-mono">-</div>
                          </div>
                          <div className="flex">
                            <div className="flex-1 p-1 leading-tight whitespace-nowrap">6. CUTI DI LUAR TANGGUNGAN NEGARA</div>
                            <div className="w-12 p-1 border-l-[0.5px] border-black text-center font-mono">-</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1">
                        <div className="flex border-b-[0.5px] border-black">
                          <div className="flex-1 p-1 whitespace-nowrap">1. Cuti Tahunan</div>
                          <div className="w-12 p-1 border-l-[0.5px] border-black text-center font-mono">{namaCutiLower.includes('tahunan') ? '✔' : '-'}</div>
                        </div>
                        <div className="flex border-b-[0.5px] border-black">
                          <div className="flex-1 p-1 whitespace-nowrap">2. Cuti Sakit</div>
                          <div className="w-12 p-1 border-l-[0.5px] border-black text-center font-mono">{namaCutiLower.includes('sakit') ? '✔' : '-'}</div>
                        </div>
                        <div className="flex">
                          <div className="flex-1 p-1 whitespace-nowrap">3. Cuti Karena Alasan Penting</div>
                          <div className="w-12 p-1 border-l-[0.5px] border-black text-center font-mono">{namaCutiLower.includes('alasan penting') ? '✔' : '-'}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* VI. ALAMAT SELAMA MENJALANKAN CUTI */}
                  <div className="border-[1px] border-black bg-white">
                    <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">VI. ALAMAT SELAMA MENJALANKAN CUTI</div>
                    <div className="grid grid-cols-12">
                      {/* Left: Alamat (Continuous merged cell) */}
                      <div className="col-span-6 p-2 border-r-[0.5px] border-black italic leading-tight break-words whitespace-pre-wrap flex flex-col justify-start">
                        {selectedPrint.alamatSelamaCuti}
                      </div>
                      
                      {/* Right: TELP + Signature */}
                      <div className="col-span-6 flex flex-col">
                        {/* Top: TELP */}
                        <div className="grid grid-cols-12 border-b-[0.5px] border-black">
                          <div className="col-span-4 p-2 border-r-[0.5px] border-black flex items-center justify-center font-bold">
                            TELP
                          </div>
                          <div className="col-span-8 p-2 flex items-center justify-center italic">
                            {selectedPrint.noTelpHubungi}
                          </div>
                        </div>
                        
                        {/* Bottom: Signature of Pemohon with optional QR TTE */}
                        <div className="flex flex-row flex-1 min-h-[110px]">
                          <div className="w-1/3 flex items-center justify-center p-2 shrink-0">
                            {showQRPemohon ? (
                              <div className="flex items-center justify-center shrink-0">
                                <img
                                  src={pDetail?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&ecc=L&margin=0&data=${encodeURIComponent(`SIP-CUTI SETDA DEMAK - VERIFIKASI PEMOHON\nID: ${selectedPrint.id}\nNama: ${pDetail?.nama || ''}\nNIP: ${pDetail?.nip || ''}\nStatus: TTE Pemohon`)}`}
                                  alt="QR Code TTE Pemohon"
                                  className="w-18 h-18 sm:w-20 sm:h-20 print:w-20 print:h-20 object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            ) : null}
                          </div>
                          <div className="w-2/3 p-2 flex flex-col items-center justify-center">
                            <p className="signature-space whitespace-nowrap">Hormat saya,</p>
                            <p className="font-bold underline text-center whitespace-nowrap">({pDetail?.nama})</p>
                            <p className="text-center uppercase whitespace-nowrap">{isPNS ? 'NIP' : 'NI PPPK'}. {pDetail?.nip}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VII. PERTIMBANGAN ATASAN LANGSUNG */}
                  <div className="border-[1px] border-black bg-white">
                    <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">VII. PERTIMBANGAN ATASAN LANGSUNG **</div>
                    <div className="grid grid-cols-4 border-b-[0.5px] border-black text-center font-bold text-[10px]">
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
                               <img
                                 src={getPegawaiDetail(selectedPrint.atasanId)?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&ecc=L&margin=0&data=${encodeURIComponent(`SIP-CUTI SETDA DEMAK - PERTIMBANGAN ATASAN LANGSUNG\nID: ${selectedPrint.id}\nNama Atasan: ${getPegawaiNama(selectedPrint.atasanId)}\nNIP: ${getPegawaiNip(selectedPrint.atasanId)}\nStatus: TTE Atasan`)}`}
                                 alt="QR Code TTE Atasan"
                                 className="w-18 h-18 sm:w-20 sm:h-20 print:w-20 print:h-20 object-contain"
                                 referrerPolicy="no-referrer"
                                />
                             </div>
                           ) : null}
                        </div>
                        <div className="w-2/3 p-2 flex flex-col items-center">
                          <p className="font-bold text-center leading-tight signature-space">
                            {getPegawaiDetail(selectedPrint.atasanId)?.jabatan}
                          </p>
                          <p className="font-bold underline text-center whitespace-nowrap">({getPegawaiNama(selectedPrint.atasanId)})</p>
                          <p className="text-center uppercase whitespace-nowrap">NIP. {getPegawaiNip(selectedPrint.atasanId)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VIII. KEPUTUSAN PEJABAT YANG BERWENANG */}
                  <div className="border-[1px] border-black bg-white">
                    <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">VIII. KEPUTUSAN PEJABAT YANG BERWENANG MEMBERIKAN CUTI **</div>
                    <div className="grid grid-cols-4 border-b-[0.5px] border-black text-center font-bold text-[10px]">
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
                      <div className="col-span-6 border-r-[0.5px] border-black p-2 flex items-center justify-center pl-6">
                        <img
                          src={dynamicQrCode}
                          alt="QR Code Verifikasi Dokumen Cuti"
                          className="w-20 h-20 sm:w-24 sm:h-24 print:w-24 print:h-24 object-contain shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="col-span-6 flex flex-row">
                        <div className="w-1/3 flex items-center justify-center p-2 shrink-0">
                           {showQRPejabat ? (
                             <div className="flex items-center justify-center shrink-0">
                               <img
                                 src={getPegawaiDetail(selectedPrint.pejabatId)?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&ecc=L&margin=0&data=${encodeURIComponent(`SIP-CUTI SETDA DEMAK - KEPUTUSAN PEJABAT YANG BERWENANG\nID: ${selectedPrint.id}\nNama Pejabat: ${getPegawaiNama(selectedPrint.pejabatId)}\nNIP: ${getPegawaiNip(selectedPrint.pejabatId)}\nStatus: TTE Pejabat`)}`}
                                 alt="QR Code TTE Pejabat"
                                 className="w-18 h-18 sm:w-20 sm:h-20 print:w-20 print:h-20 object-contain"
                                 referrerPolicy="no-referrer"
                               />
                             </div>
                           ) : null}
                        </div>
                        <div className="w-2/3 p-2 flex flex-col items-center">
                          <p className="font-bold text-center leading-tight signature-space">
                            {getPegawaiDetail(selectedPrint.pejabatId)?.jabatan}
                          </p>
                          <p className="font-bold underline text-center whitespace-nowrap">({getPegawaiNama(selectedPrint.pejabatId)})</p>
                          <p className="text-center uppercase whitespace-nowrap">NIP. {getPegawaiNip(selectedPrint.pejabatId)}</p>
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
          </div>
        );
      })()}
    </div>
  );
}

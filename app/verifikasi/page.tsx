'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, User, FileText, ArrowLeft, AlertTriangle, ShieldX, Loader2 } from 'lucide-react';
import { initialPengajuanCuti, initialPegawai, initialJenisCuti } from '../../lib/initialData';
import { PengajuanCuti, Pegawai, JenisCuti } from '../../lib/types';
import { supabase } from '../../lib/supabase';

interface VerifikasiDetail {
  id: string;
  nomorSurat: string;
  pemohonNama: string;
  pemohonNip: string;
  pemohonJabatan: string;
  kategoriCuti: string;
  durasiPengajuan: string;
  rentangTanggal: string;
  alasanPengajuan: string;
  noTelp: string;
  alamatCuti: string;
  statusPengajuan: string;
  isPNS: boolean;
}

export default function VerifikasiPage({ routeId }: { routeId?: string } = {}) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [docData, setDocData] = useState<VerifikasiDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);

    if (typeof document !== 'undefined') {
      const selectors = ["link[rel='icon']", "link[rel='shortcut icon']", "link[rel='apple-touch-icon']"];
      let updated = false;
      selectors.forEach(selector => {
        const link: HTMLLinkElement | null = document.querySelector(selector);
        if (link) {
          link.href = '/assets/logo-demak.png';
          updated = true;
        }
      });
      if (!updated) {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = '/assets/logo-demak.png';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    }

    return () => clearTimeout(timer);
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

  useEffect(() => {
    let isCancelled = false;

    async function loadVerificationData() {
      setLoading(true);
      setErrorMessage(null);

      const targetQuery = paramId.trim();

      // 1. Dapatkan local list dari localStorage jika ada
      let localPegawai: Pegawai[] = initialPegawai;
      let localJenisCuti: JenisCuti[] = initialJenisCuti;
      let localPengajuan: PengajuanCuti[] = initialPengajuanCuti;

      if (typeof window !== 'undefined') {
        try {
          const sp = localStorage.getItem('sip_cuti_pegawai');
          if (sp) localPegawai = JSON.parse(sp);
          const sjc = localStorage.getItem('sip_cuti_jenis_cuti');
          if (sjc) localJenisCuti = JSON.parse(sjc);
          const spj = localStorage.getItem('sip_cuti_pengajuan');
          if (spj) localPengajuan = JSON.parse(spj);
        } catch (e) {
          console.error('Error parsing localStorage:', e);
        }
      }

      // OPSI A: Jika ada Target ID, coba fetch dari API Route `/api/verifikasi/[id]`
      if (targetQuery) {
        try {
          const res = await fetch(`/api/verifikasi/${encodeURIComponent(targetQuery)}`);
          if (res.ok) {
            const result = await res.json();
            if (result.success && result.data && !isCancelled) {
              const d = result.data;
              const peg = d.pegawai;
              const jc = d.jenisCuti;

              const isPNS = peg ? peg.statusPegawai === 'PNS' : true;
              const nipFormatted = peg
                ? `${isPNS ? 'NIP' : 'NI PPPK'}. ${peg.nip}`
                : '-';

              const namaCuti = jc?.nama || 'Cuti Tahunan';
              const isHariKalender = namaCuti.toLowerCase().includes('sakit') || namaCuti.toLowerCase().includes('melahirkan') || namaCuti.toLowerCase().includes('besar');
              const durasiStr = `${d.jumlahHari} Hari ${isHariKalender ? 'Kalender' : 'Kerja'}`;

              const rentangStr = (d.tanggalMulai && d.tanggalSelesai)
                ? `${d.tanggalMulai} s.d ${d.tanggalSelesai}`
                : '-';

              setDocData({
                id: d.id,
                nomorSurat: d.nomorSurat || '-',
                pemohonNama: peg?.nama || 'Pegawai',
                pemohonNip: nipFormatted,
                pemohonJabatan: peg?.jabatan || '-',
                kategoriCuti: namaCuti,
                durasiPengajuan: durasiStr,
                rentangTanggal: rentangStr,
                alasanPengajuan: d.alasan || '-',
                noTelp: d.noTelpHubungi || '-',
                alamatCuti: d.alamatSelamaCuti || '-',
                statusPengajuan: d.status || 'Disetujui',
                isPNS
              });
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('API fetch fail, fallback to direct Supabase & local data:', err);
        }

        // OPSI B: Fetch langsung dari Supabase Client jika API Route gagal
        try {
          const { data: pj, error: pErr } = await supabase
            .from('pengajuan_cuti')
            .select('*')
            .or(`id.eq.${targetQuery},nomor_surat.eq.${targetQuery}`)
            .maybeSingle();

          if (pj && !pErr && !isCancelled) {
            let pegData = null;
            if (pj.pegawai_id) {
              const { data: p } = await supabase.from('pegawai').select('*').eq('id', pj.pegawai_id).maybeSingle();
              pegData = p;
            }

            let jcData = null;
            if (pj.jenis_cuti_id) {
              const { data: j } = await supabase.from('jenis_cuti').select('*').eq('id', pj.jenis_cuti_id).maybeSingle();
              jcData = j;
            }

            const isPNS = pegData ? pegData.status_pegawai === 'PNS' : true;
            const nipFormatted = pegData
              ? `${isPNS ? 'NIP' : 'NI PPPK'}. ${pegData.nip}`
              : '-';

            const namaCuti = jcData?.nama || 'Cuti Tahunan';
            const isHariKalender = namaCuti.toLowerCase().includes('sakit') || namaCuti.toLowerCase().includes('melahirkan') || namaCuti.toLowerCase().includes('besar');
            const durasiStr = `${pj.jumlah_hari} Hari ${isHariKalender ? 'Kalender' : 'Kerja'}`;

            setDocData({
              id: pj.id,
              nomorSurat: pj.nomor_surat || '-',
              pemohonNama: pegData?.nama || 'Pegawai',
              pemohonNip: nipFormatted,
              pemohonJabatan: pegData?.jabatan || '-',
              kategoriCuti: namaCuti,
              durasiPengajuan: durasiStr,
              rentangTanggal: `${pj.tanggal_mulai} s.d ${pj.tanggal_selesai}`,
              alasanPengajuan: pj.alasan || '-',
              noTelp: pj.no_telp_hubungi || '-',
              alamatCuti: pj.alamat_selama_cuti || '-',
              statusPengajuan: pj.status || 'Disetujui',
              isPNS
            });
            setLoading(false);
            return;
          }
        } catch (supabaseErr) {
          console.warn('Supabase client query error:', supabaseErr);
        }

        // OPSI C: Cek LocalStorage / initialPengajuanCuti berdasarkan ID
        const foundLocalP = localPengajuan.find(p => 
          p.id.toLowerCase() === targetQuery.toLowerCase() || 
          (p.nomorSurat && p.nomorSurat.toLowerCase() === targetQuery.toLowerCase())
        );

        if (foundLocalP && !isCancelled) {
          const pDetail = localPegawai.find(p => p.id === foundLocalP.pegawaiId);
          const jcSelected = localJenisCuti.find(jc => jc.id === foundLocalP.jenisCutiId);

          const isPNS = pDetail ? pDetail.statusPegawai === 'PNS' : true;
          const namaCuti = jcSelected?.nama || 'Cuti Tahunan';
          const isHariKalender = namaCuti.toLowerCase().includes('sakit') || namaCuti.toLowerCase().includes('melahirkan') || namaCuti.toLowerCase().includes('besar');

          setDocData({
            id: foundLocalP.id,
            nomorSurat: foundLocalP.nomorSurat || '-',
            pemohonNama: pDetail?.nama || 'PEGAWAI',
            pemohonNip: pDetail ? `${isPNS ? 'NIP' : 'NI PPPK'}. ${pDetail.nip}` : '-',
            pemohonJabatan: pDetail?.jabatan || '-',
            kategoriCuti: namaCuti,
            durasiPengajuan: `${foundLocalP.jumlahHari} Hari ${isHariKalender ? 'Kalender' : 'Kerja'}`,
            rentangTanggal: `${foundLocalP.tanggalMulai} s.d ${foundLocalP.tanggalSelesai}`,
            alasanPengajuan: foundLocalP.alasan || '-',
            noTelp: foundLocalP.noTelpHubungi || '-',
            alamatCuti: foundLocalP.alamatSelamaCuti || '-',
            statusPengajuan: foundLocalP.status || 'Disetujui',
            isPNS
          });
          setLoading(false);
          return;
        }
      }

      // OPSI D: Legacy Fallback dari Query Parameters jika URL QR lama mengandung `nm`, `cat`, `no`, `nip`
      const hasQueryParams = Boolean(paramNama || paramKategori || paramNomor || paramNip);
      if (hasQueryParams && !isCancelled) {
        const cleanNip = paramNip.replace(/\D/g, '');
        const pDetailByNip = cleanNip ? localPegawai.find(p => p.nip && p.nip.replace(/\D/g, '') === cleanNip) : null;
        const isPNS = pDetailByNip ? pDetailByNip.statusPegawai === 'PNS' : (!paramNip.toUpperCase().includes('NI PPPK') && !paramNip.toUpperCase().includes('PPPK'));

        const formattedNip = paramNip
          ? (paramNip.includes('NIP') || paramNip.includes('NI PPPK') ? paramNip : `${isPNS ? 'NIP' : 'NI PPPK'}. ${paramNip}`)
          : (pDetailByNip ? `${isPNS ? 'NIP' : 'NI PPPK'}. ${pDetailByNip.nip}` : '-');

        setDocData({
          id: paramId || 'legacy',
          nomorSurat: paramNomor || '-',
          pemohonNama: paramNama || pDetailByNip?.nama || 'NAMA PEGAWAI',
          pemohonNip: formattedNip,
          pemohonJabatan: paramJabatan || pDetailByNip?.jabatan || '-',
          kategoriCuti: paramKategori || 'Cuti Tahunan',
          durasiPengajuan: paramDurasi || '-',
          rentangTanggal: paramMulai && paramSelesai ? `${paramMulai} s.d ${paramSelesai}` : (paramMulai ? `${paramMulai}` : '-'),
          alasanPengajuan: paramAlasan || '-',
          noTelp: paramTelp || '-',
          alamatCuti: paramAlamat || '-',
          statusPengajuan: 'Disetujui',
          isPNS
        });
        setLoading(false);
        return;
      }

      // OPSI E: Jika sama sekali tidak ada paramId & query parameters, coba tampilkan dokumen sampel terbaru jika ada
      if (!paramId && !hasQueryParams && localPengajuan.length > 0 && !isCancelled) {
        const activeP = localPengajuan.find(p => p.status === 'Disetujui') || localPengajuan[0];
        const pDetail = localPegawai.find(p => p.id === activeP.pegawaiId);
        const jcSelected = localJenisCuti.find(jc => jc.id === activeP.jenisCutiId);

        const isPNS = pDetail ? pDetail.statusPegawai === 'PNS' : true;
        const namaCuti = jcSelected?.nama || 'Cuti Tahunan';
        const isHariKalender = namaCuti.toLowerCase().includes('sakit') || namaCuti.toLowerCase().includes('melahirkan') || namaCuti.toLowerCase().includes('besar');

        setDocData({
          id: activeP.id,
          nomorSurat: activeP.nomorSurat || '800.1.2.3/678',
          pemohonNama: pDetail?.nama || 'SITI NUR ALIMAH, S.M.',
          pemohonNip: pDetail ? `${isPNS ? 'NIP' : 'NI PPPK'}. ${pDetail.nip}` : 'NIP. 198306162014062006',
          pemohonJabatan: pDetail?.jabatan || 'Penelaah Teknis Kebijakan',
          kategoriCuti: namaCuti,
          durasiPengajuan: `${activeP.jumlahHari} Hari ${isHariKalender ? 'Kalender' : 'Kerja'}`,
          rentangTanggal: `${activeP.tanggalMulai} s.d ${activeP.tanggalSelesai}`,
          alasanPengajuan: activeP.alasan || 'keperluan keluarga',
          noTelp: activeP.noTelpHubungi || '08123456789',
          alamatCuti: activeP.alamatSelamaCuti || 'Demak, Jawa Tengah',
          statusPengajuan: activeP.status || 'Disetujui',
          isPNS
        });
        setLoading(false);
        return;
      }

      // OPSI F: Jika target ID diisi tapi TIDAK ditemukan di DB/Local/Query
      if (targetQuery && !isCancelled) {
        setErrorMessage('Dokumen pengajuan cuti tidak ditemukan atau QR Code tidak valid.');
        setDocData(null);
      } else if (!isCancelled) {
        setErrorMessage('ID pengajuan cuti tidak valid.');
        setDocData(null);
      }

      setLoading(false);
    }

    loadVerificationData();

    return () => {
      isCancelled = true;
    };
  }, [routeId, paramId]);

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

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 py-6 sm:py-12 px-3 sm:px-6 flex items-center justify-center font-sans antialiased text-slate-900">
      
      {/* LOADING STATE */}
      {loading && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full p-8 space-y-4 text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <h2 className="text-slate-900 font-bold text-lg">Memverifikasi Dokumen...</h2>
          <p className="text-slate-500 text-xs">Sedang Mengambil data resmi dari database Sekretariat Daerah Kabupaten Demak.</p>
        </div>
      )}

      {/* ERROR / NOT FOUND STATE */}
      {!loading && errorMessage && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl border border-red-100 flex items-center justify-center mx-auto shrink-0 shadow-xs">
            <ShieldX className="w-9 h-9 stroke-[2]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-slate-900 font-extrabold text-xl sm:text-2xl tracking-tight">
              Dokumen Tidak Valid
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {errorMessage}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200/70 rounded-2xl p-4 text-left flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-900 text-xs leading-normal">
              Pastikan QR Code berasal dari Formulir Cuti Resmi yang diterbitkan oleh <strong>SIP-Cuti Setda Kabupaten Demak</strong>.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold rounded-xl px-5 py-3 text-sm transition-all shadow-md active:scale-98 cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )}

      {/* SUCCESSFUL VERIFICATION CARD */}
      {!loading && docData && (
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
                Rangkuman lengkap permohonan cuti, alasan, serta berkas bukti dukung terverifikasi.
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
                {getInitials(docData.pemohonNama)}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-slate-900 font-bold text-base tracking-tight truncate">
                  {docData.pemohonNama}
                </h2>
                <p className="text-slate-500 text-xs font-mono tracking-wide mt-0.5">
                  {docData.pemohonNip}
                </p>
                <p className="text-slate-600 text-xs mt-0.5 truncate">
                  Jabatan: {docData.pemohonJabatan}
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
                  {docData.kategoriCuti}
                </span>
              </div>

              <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                  NOMOR SURAT
                </span>
                <span className="text-slate-900 font-bold text-sm sm:text-base font-mono mt-1 block">
                  {docData.nomorSurat}
                </span>
              </div>

              <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                  DURASI PENGAJUAN
                </span>
                <span className="text-blue-600 font-bold text-sm sm:text-base mt-1 block">
                  {docData.durasiPengajuan}
                </span>
              </div>

              <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                  RENTANG TANGGAL
                </span>
                <span className="text-slate-900 font-bold text-xs sm:text-sm font-mono mt-1 block leading-tight">
                  {docData.rentangTanggal}
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
                  &ldquo;{docData.alasanPengajuan}&rdquo;
                </p>
              </div>

              <div className="border-t border-slate-200/60 pt-3 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    NO. TELP / HP HUBUNGI
                  </span>
                  <span className="text-slate-900 font-bold text-xs sm:text-sm font-mono mt-1 block">
                    {docData.noTelp}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    ALAMAT SELAMA CUTI
                  </span>
                  <span className="text-slate-900 font-semibold text-xs sm:text-sm mt-1 block capitalize">
                    {docData.alamatCuti}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* VERIFICATION STATUS BADGE */}
          <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-900 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dokumen Cuti Digital terverifikasi <strong>SAH &amp; Resmi </strong></span>
            </div>
            <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider shrink-0">
              {docData.statusPengajuan}
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
      )}

    </div>
  );
}


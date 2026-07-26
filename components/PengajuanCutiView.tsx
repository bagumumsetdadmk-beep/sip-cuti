'use client';

/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  FileEdit, 
  X, 
  Calendar, 
  Info, 
  User, 
  Check, 
  Ban, 
  RefreshCw,
  Scale,
  Edit2,
  Download,
  Upload,
  FileText,
  Paperclip,
  ExternalLink,
  Eye
} from 'lucide-react';
import { PengajuanCuti, Pegawai, JenisCuti, AtasanPejabat, SisaCutiTahunan } from '../lib/types';
import { useToast } from '../lib/ToastContext';
import Pagination from './Pagination';
import SearchableSelect from './SearchableSelect';
import { supabase } from '../lib/supabase';
import { filterPengajuanByRole } from '../lib/pengajuanFilters';

interface PengajuanCutiViewProps {
  pengajuan: PengajuanCuti[];
  pegawai: Pegawai[];
  jenisCuti: JenisCuti[];
  atasanPejabat: AtasanPejabat[];
  sisaCuti: SisaCutiTahunan[];
  currentUser: {
    role: string;
    nama: string;
    pegawaiId?: string;
  } | null;
  addPengajuan: (p: Omit<PengajuanCuti, 'id' | 'status' | 'nomorSurat'> & { nomorSurat?: string }) => Promise<any>;
  updatePengajuanStatus: (id: string, status: PengajuanCuti['status'], catatan?: string) => Promise<void>;
  updatePengajuan: (id: string, p: Partial<PengajuanCuti>) => Promise<void>;
  deletePengajuan: (id: string) => Promise<void>;
  hitungHariKerja: (start: string, end: string, jenisCutiId?: string) => number;
  hitungTanggalSelesai: (start: string, days: number, jenisCutiId?: string) => string;
  hitungTotalCutiTahunan: (sc: SisaCutiTahunan | undefined) => number;
  isApprovalPage?: boolean;
}

export default function PengajuanCutiView({
  pengajuan,
  pegawai,
  jenisCuti,
  atasanPejabat,
  sisaCuti,
  currentUser,
  addPengajuan,
  updatePengajuanStatus,
  updatePengajuan,
  deletePengajuan,
  hitungHariKerja,
  hitungTanggalSelesai,
  hitungTotalCutiTahunan,
  isApprovalPage = false
}: PengajuanCutiViewProps) {
  const { showToast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');

  const [showFormModal, setShowFormModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPj, setSelectedPj] = useState<PengajuanCuti | null>(null);

  // Form States (Tambah Pengajuan)
  const [formPegawaiId, setFormPegawaiId] = useState('');
  const [formJenisCutiId, setFormJenisCutiId] = useState('jc-1'); // Default Cuti Tahunan
  const [formTanggalPengajuan, setFormTanggalPengajuan] = useState(new Date().toISOString().split('T')[0]);
  const [formNomorSurat, setFormNomorSurat] = useState('');
  const [formMulai, setFormMulai] = useState('');
  const [formHari, setFormHari] = useState(0); // Input from user
  const [formSelesai, setFormSelesai] = useState(''); // Calculated
  const [formAlasan, setFormAlasan] = useState('');
  const [formAlamat, setFormAlamat] = useState('');
  const [formNoTelp, setFormNoTelp] = useState('');
  const [formBerkasPendukung, setFormBerkasPendukung] = useState<string | undefined>();
  const [isUploading, setIsUploading] = useState(false);
  const [formAtasanId, setFormAtasanId] = useState('');
  const [formPejabatId, setFormPejabatId] = useState('');
  const [formMetodeTtd, setFormMetodeTtd] = useState<'TTE' | 'MANUAL' | 'HYBRID'>('TTE');
  const [formTtdDigitalPemohon, setFormTtdDigitalPemohon] = useState(true);
  const [formTtdDigitalAtasan, setFormTtdDigitalAtasan] = useState(true);
  const [formTtdDigitalPejabat, setFormTtdDigitalPejabat] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Approval Modal States
  const [appCatatan, setAppCatatan] = useState('');
  const [isViewOnlyModal, setIsViewOnlyModal] = useState(false);

  // Menghitung Tanggal Selesai otomatis jika tanggal mulai dan hari berubah
  useEffect(() => {
    if (formMulai && formHari > 0) {
      const selesai = hitungTanggalSelesai(formMulai, formHari, formJenisCutiId);
      setFormSelesai(selesai);
    } else {
      setFormSelesai('');
    }
  }, [formMulai, formHari, formJenisCutiId, hitungTanggalSelesai]);

  // Filter Jenis Cuti berdasarkan Status Pegawai & Masa Kerja
  const filteredJenisCuti = React.useMemo(() => {
    const selectedPegawai = pegawai.find(p => p.id === formPegawaiId);
    if (!selectedPegawai) return jenisCuti;

    return jenisCuti.filter(jc => {
      const status = selectedPegawai.statusPegawai;
      const namaCuti = jc.nama.toLowerCase();

      // 1. Aturan PPPK: Hanya boleh Tahunan, Sakit, Melahirkan
      if (status.includes('PPPK')) {
        const allowed = ['tahunan', 'sakit', 'melahirkan'];
        return allowed.some(a => namaCuti.includes(a));
      }

      // 2. Aturan PNS: Sembunyikan Cuti Besar jika Masa Kerja < 5 Tahun
      if (status === 'PNS') {
        if (namaCuti.includes('besar')) {
          const match = selectedPegawai.masaKerja.match(/(\d+)\s*Tahun/);
          const tahun = match ? parseInt(match[1]) : 0;
          if (tahun < 5) return false;
        }
        return true;
      }

      return true;
    });
  }, [pegawai, formPegawaiId, jenisCuti]);

  // Derived state to check if selected leave type is Cuti Tahunan
  const isCutiTahunanSelected = React.useMemo(() => {
    const selected = jenisCuti.find(jc => jc.id === formJenisCutiId);
    return selected ? (selected.nama.toLowerCase().includes('tahunan') || selected.id === 'jc-1') : false;
  }, [jenisCuti, formJenisCutiId]);

  // Check if selected leave type includes holidays & weekends in its duration (Aturan BKN)
  const selectedJenisCutiCountsHolidays = React.useMemo(() => {
    const selected = jenisCuti.find(jc => jc.id === formJenisCutiId);
    if (!selected) return false;
    const nameLower = selected.nama.toLowerCase();
    return nameLower.includes('sakit') || nameLower.includes('melahirkan') || nameLower.includes('besar') || nameLower.includes('luar tanggungan');
  }, [jenisCuti, formJenisCutiId]);

  // Reset Jenis Cuti jika yang terpilih tidak lagi tersedia untuk pegawai tersebut
  useEffect(() => {
    if (formJenisCutiId && filteredJenisCuti.length > 0) {
      const isValid = filteredJenisCuti.some(jc => jc.id === formJenisCutiId);
      if (!isValid) {
        setFormJenisCutiId(filteredJenisCuti[0].id);
      }
    }
  }, [filteredJenisCuti, formJenisCutiId]);

  // Otomatis isi data pegawai & atasan jika operator login
  useEffect(() => {
    if (showFormModal && !editingId) {
      setFormPegawaiId('');

      // Default ke Cuti Tahunan yang terdaftar di database
      const cutiTahunan = jenisCuti.find(jc => jc.nama.toLowerCase().includes('tahunan') || jc.id === 'jc-1');
      if (cutiTahunan) {
        setFormJenisCutiId(cutiTahunan.id);
      } else if (jenisCuti.length > 0) {
        setFormJenisCutiId(jenisCuti[0].id);
      }

      // Cari Pejabat dan Atasan yang Aktif
      const atasanList = atasanPejabat.filter(ap => (ap.peran === 'Atasan Langsung' || ap.peran === 'Kedua Peran') && ap.statusActive);
      const pejabatList = atasanPejabat.filter(ap => (ap.peran === 'Pejabat Penanggung Jawab' || ap.peran === 'Kedua Peran') && ap.statusActive);

      if (atasanList.length > 0) setFormAtasanId(atasanList[0].pegawaiId);
      if (pejabatList.length > 0) setFormPejabatId(pejabatList[0].pegawaiId);
    }
  }, [showFormModal, currentUser, pegawai, atasanPejabat, editingId, jenisCuti]);

  const getPegawaiNama = (id: string) => pegawai.find(p => p.id === id)?.nama || 'Pegawai';
  const getPegawaiNip = (id: string) => pegawai.find(p => p.id === id)?.nip || '-';
  const getJenisCutiNama = (id: string) => jenisCuti.find(jc => jc.id === id)?.nama || 'Cuti';

  const isHariKalender = (jenisCutiId: string) => {
    const selected = jenisCuti.find(jc => jc.id === jenisCutiId);
    if (!selected) return false;
    const nameLower = selected.nama.toLowerCase();
    return nameLower.includes('sakit') || nameLower.includes('melahirkan') || nameLower.includes('besar') || nameLower.includes('luar tanggungan');
  };

  // State tab filter alur persetujuan
  const [activeStageTab, setActiveStageTab] = useState<'semua' | 'verifikator' | 'atasan' | 'pejabat' | 'disetujui' | 'ditolak'>('semua');

  useEffect(() => {
    if (isApprovalPage) {
      if (currentUser?.role === 'Atasan') {
        setActiveStageTab('atasan');
      } else if (currentUser?.role === 'Pejabat') {
        setActiveStageTab('pejabat');
      } else if (currentUser?.role === 'Verifikator') {
        setActiveStageTab('verifikator');
      } else {
        setActiveStageTab('semua');
      }
    } else {
      setActiveStageTab('semua');
    }
  }, [currentUser, isApprovalPage]);

  // Filter pengajuan berdasarkan Role & Halaman (Tabel Pengajuan Cuti vs Tabel Persetujuan Cuti)
  const userPengajuan = useMemo(() => {
    return filterPengajuanByRole(pengajuan, currentUser, isApprovalPage);
  }, [pengajuan, currentUser, isApprovalPage]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const filteredPengajuanBase = userPengajuan.filter(pj => {
    // Filter Pencarian
    const matchesSearch = 
      getPegawaiNama(pj.pegawaiId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getJenisCutiNama(pj.jenisCutiId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      pj.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Filter Berdasarkan Tab Alur Approval
    const st = (pj.status || '').toUpperCase();
    if (activeStageTab === 'verifikator') {
      if (st !== 'MENUNGGU' && st !== 'SUDAH DIPERBAIKI' && st !== 'DALAM PERBAIKAN' && st !== 'PROSES_VERIFIKATOR' && st !== 'PERBAIKAN') return false;
    } else if (activeStageTab === 'atasan') {
      if (st !== 'MENUNGGU ATASAN' && st !== 'PROSES_ATASAN' && st !== 'DISETUJUI VERIFIKATOR') return false;
    } else if (activeStageTab === 'pejabat') {
      if (st !== 'MENUNGGU PEJABAT' && st !== 'PROSES_PEJABAT' && st !== 'DISETUJUI ATASAN') return false;
    } else if (activeStageTab === 'disetujui') {
      if (st !== 'DISETUJUI') return false;
    } else if (activeStageTab === 'ditolak') {
      if (st !== 'DITOLAK' && st !== 'DALAM PERBAIKAN' && st !== 'PERBAIKAN') return false;
    }

    return true;
  });
  const totalPages = Math.ceil(filteredPengajuanBase.length / itemsPerPage);
  const filteredPengajuan = filteredPengajuanBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openAddModal = () => {
    setEditingId(null);
    setFormTanggalPengajuan(new Date().toISOString().split('T')[0]);
    setFormNomorSurat('');
    setFormPegawaiId('');
    
    const cutiTahunan = jenisCuti.find(jc => jc.nama.toLowerCase().includes('tahunan') || jc.id === 'jc-1');
    setFormJenisCutiId(cutiTahunan ? cutiTahunan.id : (jenisCuti.length > 0 ? jenisCuti[0].id : ''));

    setFormMulai('');
    setFormHari(0);
    setFormSelesai('');
    setFormAlasan('');
    setFormAlamat('');
    setFormNoTelp('');
    setFormBerkasPendukung(undefined);
    setFormMetodeTtd('TTE');
    setFormTtdDigitalPemohon(true);
    setFormTtdDigitalAtasan(true);
    setFormTtdDigitalPejabat(true);
    setShowFormModal(true);
  };

  const openEditModal = (pj: PengajuanCuti) => {
    if (pj.status !== 'Menunggu' && pj.status !== 'Dalam Perbaikan' && pj.status !== 'Sudah Diperbaiki') {
      showToast('Hanya pengajuan dengan status Menunggu, Dalam Perbaikan, atau Sudah Diperbaiki yang dapat diedit.', 'error');
      return;
    }
    setEditingId(pj.id);
    setFormTanggalPengajuan(pj.tanggalPengajuan || new Date().toISOString().split('T')[0]);
    setFormNomorSurat(pj.nomorSurat || '');
    setFormPegawaiId(pj.pegawaiId);
    setFormJenisCutiId(pj.jenisCutiId);
    setFormMulai(pj.tanggalMulai);
    setFormHari(pj.jumlahHari);
    setFormSelesai(pj.tanggalSelesai);
    setFormAlasan(pj.alasan);
    setFormAlamat(pj.alamatSelamaCuti || '');
    setFormNoTelp(pj.noTelpHubungi || '');
    setFormBerkasPendukung(pj.berkasPendukung);
    setFormAtasanId(pj.atasanId);
    setFormPejabatId(pj.pejabatId);
    
    const metode = pj.metodePenandatanganan || (
      pj.ttdDigitalPemohon !== false && pj.ttdDigitalAtasan === false && pj.ttdDigitalPejabat === false
        ? 'HYBRID'
        : (pj.ttdDigitalAtasan === false && pj.ttdDigitalPejabat === false ? 'MANUAL' : 'TTE')
    );
    setFormMetodeTtd(metode);
    setFormTtdDigitalPemohon(metode === 'TTE' || metode === 'HYBRID');
    setFormTtdDigitalAtasan(metode === 'TTE');
    setFormTtdDigitalPejabat(metode === 'TTE');
    setShowFormModal(true);
  };

  const openDetailModal = (pj: PengajuanCuti) => {
    setSelectedPj(pj);
    setAppCatatan('');
    setIsViewOnlyModal(true);
    setShowApprovalModal(true);
  };

  const openApprovalModal = (pj: PengajuanCuti) => {
    setSelectedPj(pj);
    setAppCatatan('');
    setIsViewOnlyModal(false);
    setShowApprovalModal(true);
  };

  const openDeleteConfirm = (pj: PengajuanCuti) => {
    setSelectedPj(pj);
    setShowDeleteConfirm(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPegawaiId || !formJenisCutiId || !formMulai || !formHari || !formAlasan || !formAlamat || !formAtasanId || !formPejabatId || !formNoTelp || !formNomorSurat) {
      showToast('Harap lengkapi semua kolom formulir pengajuan termasuk Nomor Nota Dinas!', 'error');
      return;
    }

    if (formHari === 0) {
      showToast('Jumlah hari cuti tidak boleh 0!', 'error');
      return;
    }

    // Validasi Tanggal Pelaksanaan Cuti minimal 3 hari setelah tanggal pengajuan
    const tglPengajuan = new Date(formTanggalPengajuan);
    const tglMulai = new Date(formMulai);
    const diffTime = tglMulai.getTime() - tglPengajuan.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 3) {
      showToast('Tanggal pelaksanaan cuti minimal 3 hari setelah tanggal pengajuan!', 'error');
      return;
    }

    // Validasi Cuti Tahunan: Check Sisa Kuota
    if (isCutiTahunanSelected) {
      const sc = sisaCuti.find(s => s.pegawaiId === formPegawaiId);
      const totalSisa = sc ? (sc.sisaN2 + sc.sisaN1 + sc.sisaN) : 0;
      if (formHari > totalSisa) {
        showToast(`Kuota sisa cuti tahunan tidak mencukupi! Durasi pengajuan adalah ${formHari} hari kerja, sedangkan total sisa kuota pegawai yang tersedia adalah ${totalSisa} hari kerja.`, 'error');
        return;
      }
    }

    // Validasi Hak Jenis Cuti (PPPK tidak boleh Cuti Besar atau CLTN)
    const pegStatus = pegawai.find(p => p.id === formPegawaiId)?.statusPegawai;
    const jcLimit = jenisCuti.find(jc => jc.id === formJenisCutiId)?.hakPegawai;
    if (pegStatus === 'PPPK' && jcLimit === 'PNS') {
      showToast('Pegawai berstatus PPPK tidak diperkenankan mengajukan jenis cuti ini menurut aturan BKN.', 'error');
      return;
    }

    if (editingId) {
      const existingPj = pengajuan.find(p => p.id === editingId);
      const newStatus = existingPj?.status === 'Dalam Perbaikan' ? 'Sudah Diperbaiki' : existingPj?.status;
      
      updatePengajuan(editingId, {
        pegawaiId: formPegawaiId,
        jenisCutiId: formJenisCutiId,
        tanggalPengajuan: formTanggalPengajuan,
        tanggalMulai: formMulai,
        tanggalSelesai: formSelesai,
        jumlahHari: formHari,
        alasan: formAlasan,
        alamatSelamaCuti: formAlamat,
        noTelpHubungi: formNoTelp,
        berkasPendukung: formBerkasPendukung,
        atasanId: formAtasanId,
        pejabatId: formPejabatId,
        nomorSurat: formNomorSurat,
        metodePenandatanganan: formMetodeTtd,
        ttdDigitalPemohon: formMetodeTtd === 'TTE' || formMetodeTtd === 'HYBRID',
        ttdDigitalAtasan: formMetodeTtd === 'TTE',
        ttdDigitalPejabat: formMetodeTtd === 'TTE',
        status: newStatus
      });
      showToast('Pengajuan cuti berhasil diperbarui.', 'success');
    } else {
      addPengajuan({
        pegawaiId: formPegawaiId,
        jenisCutiId: formJenisCutiId,
        tanggalPengajuan: formTanggalPengajuan,
        tanggalMulai: formMulai,
        tanggalSelesai: formSelesai,
        jumlahHari: formHari,
        alasan: formAlasan,
        alamatSelamaCuti: formAlamat,
        noTelpHubungi: formNoTelp,
        berkasPendukung: formBerkasPendukung,
        atasanId: formAtasanId,
        pejabatId: formPejabatId,
        nomorSurat: formNomorSurat,
        metodePenandatanganan: formMetodeTtd,
        ttdDigitalPemohon: formMetodeTtd === 'TTE' || formMetodeTtd === 'HYBRID',
        ttdDigitalAtasan: formMetodeTtd === 'TTE',
        ttdDigitalPejabat: formMetodeTtd === 'TTE'
      });
      showToast('Pengajuan cuti baru berhasil ditambahkan.', 'success');
    }

    setShowFormModal(false);
  };

  const handleApprovalAction = (actionType: PengajuanCuti['status']) => {
    if (!selectedPj) return;

    let targetStatus: PengajuanCuti['status'] = actionType;

    if (actionType === 'Disetujui') {
      // 1. Verifikator Approval Stage (Menunggu / Sudah Diperbaiki / Dalam Perbaikan)
      if (selectedPj.status === 'Menunggu' || selectedPj.status === 'Sudah Diperbaiki' || selectedPj.status === 'Dalam Perbaikan') {
        if (selectedPj.ttdDigitalAtasan) {
          targetStatus = 'Menunggu Atasan';
        } else {
          // Manual TTD Basah -> Directly approved upon Verifikator approval
          targetStatus = 'Disetujui';
        }
      }
      // 2. Atasan Langsung Approval Stage (Menunggu Atasan)
      else if (selectedPj.status === 'Menunggu Atasan') {
        if (selectedPj.ttdDigitalPejabat) {
          targetStatus = 'Menunggu Pejabat';
        } else {
          targetStatus = 'Disetujui';
        }
      }
      // 3. Pejabat Penanggung Jawab Approval Stage (Menunggu Pejabat)
      else if (selectedPj.status === 'Menunggu Pejabat') {
        targetStatus = 'Disetujui';
      }
    }

    updatePengajuanStatus(selectedPj.id, targetStatus, appCatatan);

    let toastMsg = `Status pengajuan berhasil diperbarui.`;
    if (targetStatus === 'Menunggu Atasan') {
      toastMsg = 'Verifikasi Bagian disetujui! Berkas berhasil diteruskan ke Atasan Langsung untuk TTE QR Code.';
    } else if (targetStatus === 'Menunggu Pejabat') {
      toastMsg = 'Persetujuan Atasan Langsung berhasil! Berkas diteruskan ke Pejabat Penanggung Jawab untuk TTE QR Code final.';
    } else if (targetStatus === 'Disetujui') {
      toastMsg = 'Pengajuan Cuti telah disetujui sepenuhnya dan kini siap untuk dicetak!';
    } else if (targetStatus === 'Ditolak') {
      toastMsg = 'Pengajuan cuti ditolak.';
    } else if (targetStatus === 'Dalam Perbaikan') {
      toastMsg = 'Berkas dikembalikan ke Operator/Pemohon untuk perbaikan.';
    }

    showToast(toastMsg, targetStatus === 'Disetujui' ? 'success' : targetStatus === 'Ditolak' ? 'error' : 'info');
    setShowApprovalModal(false);
    setSelectedPj(null);
  };

  const handleDelete = () => {
    if (selectedPj) {
      deletePengajuan(selectedPj.id);
      showToast('Pengajuan cuti berhasil dihapus.', 'info');
      setShowDeleteConfirm(false);
      setSelectedPj(null);
    }
  };

  const canApprove = (pj: PengajuanCuti) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    if (currentUser.role === 'Operator') return false;

    // Stage 1: Verifikasi Bagian
    if (pj.status === 'Menunggu' || pj.status === 'Sudah Diperbaiki' || pj.status === 'Dalam Perbaikan') {
      return currentUser.role === 'Verifikator';
    }

    // Stage 2: TTE Atasan Langsung
    if (pj.status === 'Menunggu Atasan') {
      if (currentUser.role === 'Verifikator') return true;
      if (currentUser.role === 'Atasan') {
        if (currentUser.pegawaiId) {
          return currentUser.pegawaiId === pj.atasanId;
        }
        return true;
      }
      if (currentUser.pegawaiId && currentUser.pegawaiId === pj.atasanId) return true;
      return false;
    }

    // Stage 3: TTE Pejabat Final
    if (pj.status === 'Menunggu Pejabat') {
      if (currentUser.role === 'Verifikator') return true;
      if (currentUser.role === 'Pejabat') {
        if (currentUser.pegawaiId) {
          return currentUser.pegawaiId === pj.pejabatId;
        }
        return true;
      }
      if (currentUser.pegawaiId && currentUser.pegawaiId === pj.pejabatId) return true;
      return false;
    }

    return false;
  };

  const isVerifikatorForThis = (pj: PengajuanCuti) => {
    return canApprove(pj);
  };

  const handleExportTemplate = () => {
    const samplePeg = pegawai[0]?.nip || '198501012010011001';
    
    const activeAtasan = atasanPejabat.find(ap => (ap.peran === 'Atasan Langsung' || ap.peran === 'Kedua Peran') && ap.statusActive);
    const activePejabat = atasanPejabat.find(ap => (ap.peran === 'Pejabat Penanggung Jawab' || ap.peran === 'Kedua Peran') && ap.statusActive);
    
    const sampleAtasanPeg = pegawai.find(p => p.id === activeAtasan?.pegawaiId);
    const samplePejabatPeg = pegawai.find(p => p.id === activePejabat?.pegawaiId);
    
    const sampleAtasanNip = sampleAtasanPeg?.nip || '197501011998011002';
    const samplePejabatNip = samplePejabatPeg?.nip || '197001011995011001';

    const ws = XLSX.utils.json_to_sheet([
      {
        'NIP Pegawai': samplePeg,
        'Jenis Cuti': 'Cuti Tahunan',
        'Tanggal Mulai': '2026-08-10',
        'Jumlah Hari': 5,
        'Alasan': 'Kepentingan Keluarga di Luar Kota',
        'Alamat Selama Cuti': 'Jl. Kabupaten No. 45, Demak',
        'No HP': '081234567890',
        'NIP Atasan Langsung': sampleAtasanNip,
        'NIP Pejabat Berwenang': samplePejabatNip,
        'Tanggal Pengajuan': '2026-08-01'
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Pengajuan_Cuti");
    XLSX.writeFile(wb, "Template_Pengajuan_Cuti.xlsx");
    showToast('Template Pengajuan Cuti berhasil diunduh.', 'success');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const ab = evt.target?.result;
          const wb = XLSX.read(ab, { type: 'array' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          let successCount = 0;
          let failCount = 0;
          
          for (const row of data as any[]) {
            const rawNip = row['NIP Pegawai'];
            const rawJenisCuti = row['Jenis Cuti'];
            const rawTanggalMulai = row['Tanggal Mulai'];
            const rawJumlahHari = row['Jumlah Hari'];
            const rawAlasan = row['Alasan'];
            const rawAlamat = row['Alamat Selama Cuti'];
            const rawNoHp = row['No HP'];
            const rawNipAtasan = row['NIP Atasan Langsung'];
            const rawNipPejabat = row['NIP Pejabat Berwenang'];
            const rawTanggalPengajuan = row['Tanggal Pengajuan'];

            if (!rawNip || !rawJenisCuti || !rawTanggalMulai || !rawJumlahHari || !rawAlasan) {
              failCount++;
              continue;
            }

            const nipStr = String(rawNip).trim().replace(/\s/g, '');
            const targetPegawai = pegawai.find(p => p.nip.trim().replace(/\s/g, '') === nipStr);
            if (!targetPegawai) {
              failCount++;
              continue;
            }

            const targetJenis = jenisCuti.find(jc => jc.nama.toLowerCase().includes(String(rawJenisCuti).trim().toLowerCase()));
            if (!targetJenis) {
              failCount++;
              continue;
            }

            let formattedMulai = String(rawTanggalMulai).trim();
            if (!isNaN(Number(formattedMulai)) && Number(formattedMulai) > 30000) {
              const excelDate = new Date((Number(formattedMulai) - 25569) * 86400 * 1000);
              formattedMulai = excelDate.toISOString().split('T')[0];
            }

            let formattedPengajuan = rawTanggalPengajuan ? String(rawTanggalPengajuan).trim() : new Date().toISOString().split('T')[0];
            if (!isNaN(Number(formattedPengajuan)) && Number(formattedPengajuan) > 30000) {
              const excelDate = new Date((Number(formattedPengajuan) - 25569) * 86400 * 1000);
              formattedPengajuan = excelDate.toISOString().split('T')[0];
            }

            let atasanIdVal = '';
            if (rawNipAtasan) {
              const nipAtasanStr = String(rawNipAtasan).trim().replace(/\s/g, '');
              const at = pegawai.find(p => p.nip.trim().replace(/\s/g, '') === nipAtasanStr);
              if (at) atasanIdVal = at.id;
            }
            if (!atasanIdVal) {
              const activeAtasan = atasanPejabat.find(ap => (ap.peran === 'Atasan Langsung' || ap.peran === 'Kedua Peran') && ap.statusActive);
              if (activeAtasan) atasanIdVal = activeAtasan.pegawaiId;
            }

            let pejabatIdVal = '';
            if (rawNipPejabat) {
              const nipPejabatStr = String(rawNipPejabat).trim().replace(/\s/g, '');
              const pj = pegawai.find(p => p.nip.trim().replace(/\s/g, '') === nipPejabatStr);
              if (pj) pejabatIdVal = pj.id;
            }
            if (!pejabatIdVal) {
              const activePejabat = atasanPejabat.find(ap => (ap.peran === 'Pejabat Penanggung Jawab' || ap.peran === 'Kedua Peran') && ap.statusActive);
              if (activePejabat) pejabatIdVal = activePejabat.pegawaiId;
            }

            const days = Number(rawJumlahHari);
            const selesai = hitungTanggalSelesai(formattedMulai, days, targetJenis.id);

            await addPengajuan({
              pegawaiId: targetPegawai.id,
              jenisCutiId: targetJenis.id,
              tanggalPengajuan: formattedPengajuan,
              tanggalMulai: formattedMulai,
              tanggalSelesai: selesai,
              jumlahHari: days,
              alasan: String(rawAlasan).trim(),
              alamatSelamaCuti: rawAlamat ? String(rawAlamat).trim() : '-',
              noTelpHubungi: rawNoHp ? String(rawNoHp).trim() : '-',
              atasanId: atasanIdVal,
              pejabatId: pejabatIdVal
            });
            successCount++;
          }
          
          if (failCount > 0) {
            showToast(`Selesai mengimpor: ${successCount} pengajuan berhasil, ${failCount} baris dilewati karena NIP/Jenis Cuti tidak valid.`, 'info');
          } else {
            showToast(`Berhasil mengimpor ${successCount} pengajuan cuti dari Excel.`, 'success');
          }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">
            {isApprovalPage ? 'Lembar Persetujuan & TTE Cuti ASN' : 'Transaksi Pengajuan Cuti ASN'}
          </h3>
          <p className="text-xs text-gray-500">
            {isApprovalPage 
              ? 'Verifikasi lembar kerja, persetujuan atasan langsung, dan Penandatanganan Elektronik (TTE) pejabat berwenang.' 
              : 'Kelola pendaftaran berkas permohonan cuti baru, verifikasi persetujuan pimpinan, dan pelacakan status workflow.'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Hanya admin yang bisa mengunduh template atau mengimpor data pengajuan */}
          {currentUser?.role === 'Admin' && !isApprovalPage && (
            <>
              <button
                id="btn-export-template-pengajuan"
                onClick={handleExportTemplate}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-gray-500" />
                <span>Unduh Template</span>
              </button>

              <label className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer">
                <Upload className="w-4 h-4 text-gray-500" />
                <span>Import Excel</span>
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportData} />
              </label>
            </>
          )}

          {/* Hanya operator/admin yang bisa tambah cuti baru (tidak pada halaman persetujuan) */}
          {(currentUser?.role === 'Operator' || currentUser?.role === 'Admin') && !isApprovalPage && (
            <button
              id="btn-pengajuan-baru"
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan Cuti Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter / Search & Stage Filter Tabs */}
      <div className="space-y-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama pegawai, jenis cuti, nomor surat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
            <span>Pengajuan Terdaftar: <strong className="text-gray-800">{filteredPengajuanBase.length}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Perlu Tindakan: <strong className="text-amber-600">{filteredPengajuanBase.filter(pj => pj.status === 'Menunggu' || pj.status === 'Menunggu Atasan' || pj.status === 'Menunggu Pejabat').length}</strong></span>
          </div>
        </div>

        {/* Tab Filter Alur Approval (Disesuaikan dengan Role Akun) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setActiveStageTab('semua')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeStageTab === 'semua'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua Data ({userPengajuan.length})
          </button>

          {/* Tab 1: Verifikator (Muncul untuk Admin, Verifikator, Operator, Pegawai) */}
          {(currentUser?.role === 'Admin' || currentUser?.role === 'Verifikator' || currentUser?.role === 'Operator' || currentUser?.role === 'Pegawai') && (
            <button
              onClick={() => setActiveStageTab('verifikator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeStageTab === 'verifikator'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              <span>1. Verifikator</span>
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px] font-mono">
                {userPengajuan.filter(p => {
                  const s = (p.status || '').toUpperCase();
                  return s === 'MENUNGGU' || s === 'SUDAH DIPERBAIKI' || s === 'DALAM PERBAIKAN' || s === 'PROSES_VERIFIKATOR' || s === 'PERBAIKAN';
                }).length}
              </span>
            </button>
          )}

          {/* Tab 2: TTE Atasan Langsung (Muncul untuk Admin, Verifikator, Operator, Atasan) */}
          {(currentUser?.role === 'Admin' || currentUser?.role === 'Verifikator' || currentUser?.role === 'Operator' || currentUser?.role === 'Atasan') && (
            <button
              onClick={() => setActiveStageTab('atasan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeStageTab === 'atasan'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              <span>2. TTE Atasan Langsung</span>
              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full text-[10px] font-mono">
                {userPengajuan.filter(p => {
                  const s = (p.status || '').toUpperCase();
                  return s === 'MENUNGGU ATASAN' || s === 'PROSES_ATASAN' || s === 'DISETUJUI VERIFIKATOR';
                }).length}
              </span>
            </button>
          )}

          {/* Tab 3: TTE Pejabat Final (Muncul untuk Admin, Verifikator, Operator, Pejabat) */}
          {(currentUser?.role === 'Admin' || currentUser?.role === 'Verifikator' || currentUser?.role === 'Operator' || currentUser?.role === 'Pejabat') && (
            <button
              onClick={() => setActiveStageTab('pejabat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeStageTab === 'pejabat'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
              }`}
            >
              <span>3. TTE Pejabat Final</span>
              <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded-full text-[10px] font-mono">
                {userPengajuan.filter(p => {
                  const s = (p.status || '').toUpperCase();
                  return s === 'MENUNGGU PEJABAT' || s === 'PROSES_PEJABAT' || s === 'DISETUJUI ATASAN';
                }).length}
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveStageTab('disetujui')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeStageTab === 'disetujui'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-teal-700 border border-teal-200 hover:bg-teal-50'
            }`}
          >
            <span>Disetujui (Siap Cetak)</span>
            <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded-full text-[10px] font-mono">
              {userPengajuan.filter(p => (p.status || '').toUpperCase() === 'DISETUJUI').length}
            </span>
          </button>
          <button
            onClick={() => setActiveStageTab('ditolak')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeStageTab === 'ditolak'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            <span>Ditolak / Revisi</span>
            <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded-full text-[10px] font-mono">
              {userPengajuan.filter(p => {
                const s = (p.status || '').toUpperCase();
                return s === 'DITOLAK' || s === 'DALAM PERBAIKAN' || s === 'PERBAIKAN';
              }).length}
            </span>
          </button>
        </div>
      </div>

      {/* List Tabel Pengajuan */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                <th className="p-4">Tanggal Pengajuan</th>
                <th className="p-4">Nama Pemohon / Pegawai</th>
                <th className="p-4">Kategori Cuti</th>
                <th className="p-4">Rentang & Durasi</th>
                <th className="p-4 text-center">Status & Metode</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredPengajuanBase.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    Tidak ada transaksi pengajuan cuti yang ditemukan pada kategori ini.
                  </td>
                </tr>
              ) : (
                filteredPengajuan.map((pj) => {
                  const statusStyles: Record<string, string> = {
                    'Menunggu': 'bg-amber-50 text-amber-700 border-amber-200',
                    'Menunggu Atasan': 'bg-blue-50 text-blue-700 border-blue-200',
                    'Menunggu Pejabat': 'bg-purple-50 text-purple-700 border-purple-200',
                    'Disetujui': 'bg-teal-50 text-teal-700 border-teal-200',
                    'Ditolak': 'bg-rose-50 text-rose-700 border-rose-200',
                    'Dalam Perbaikan': 'bg-orange-50 text-orange-700 border-orange-200',
                    'Sudah Diperbaiki': 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  };
                  const statusLabels: Record<string, string> = {
                    'Menunggu': '1. Verifikasi',
                    'Menunggu Atasan': '2. TTE Atasan Langsung',
                    'Menunggu Pejabat': '3. TTE Pejabat Final',
                    'Disetujui': 'Disetujui (Siap Cetak)',
                    'Ditolak': 'Ditolak',
                    'Dalam Perbaikan': 'Dalam Perbaikan',
                    'Sudah Diperbaiki': '1. Diperbaiki (Verifikator)'
                  };
                  return (
                    <tr key={pj.id} className="hover:bg-gray-50/50 transition-all">
                      <td className="p-4">
                        <div className="font-bold text-gray-900 leading-tight truncate max-w-44">{pj.tanggalPengajuan}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-950">{getPegawaiNama(pj.pegawaiId)}</div>
                        <div className="text-[10px] text-gray-400 font-mono">NIP. {getPegawaiNip(pj.pegawaiId)}</div>
                      </td>
                      <td className="p-4 font-semibold text-gray-700">{getJenisCutiNama(pj.jenisCutiId)}</td>
                      <td className="p-4">
                        <div className="font-semibold text-blue-700 font-mono">
                          {pj.jumlahHari} {isHariKalender(pj.jenisCutiId) ? 'Hari Kalender' : 'Hari Kerja'}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">{pj.tanggalMulai} s.d {pj.tanggalSelesai}</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-block">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusStyles[pj.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                            {statusLabels[pj.status] || pj.status}
                          </span>
                        </div>
                        <div className="text-[9px] font-medium text-slate-500 mt-1">
                          {pj.metodePenandatanganan === 'HYBRID' || (pj.ttdDigitalPemohon !== false && pj.ttdDigitalAtasan === false && pj.ttdDigitalPejabat === false)
                            ? '⚡ TTE Hybrid'
                            : (pj.ttdDigitalAtasan && pj.ttdDigitalPejabat ? '✨ TTE Full QR' : '✍️ TTD Manual/Basah')}
                        </div>
                        {pj.catatanPerbaikan && pj.status === 'Dalam Perbaikan' && (
                          <div className="text-[9px] text-red-500 mt-1 max-w-36 leading-tight mx-auto font-medium">
                            Ket: &quot;{pj.catatanPerbaikan}&quot;
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tombol Detail / Lihat Pengajuan (Hanya dimunculkan untuk non-Admin) */}
                          {currentUser?.role !== 'Admin' && (
                            <button
                              id={`btn-detail-pj-${pj.id}`}
                              onClick={() => openDetailModal(pj)}
                              className="p-1.5 bg-gray-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded transition-all cursor-pointer"
                              title="Lihat Detail & Dokumen"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Tombol Tindak Lanjut Approval / Proses */}
                          {(currentUser?.role === 'Admin' ||
                            ((pj.status === 'Menunggu' || pj.status === 'Sudah Diperbaiki' || pj.status === 'Dalam Perbaikan' || pj.status === 'Menunggu Atasan' || pj.status === 'Menunggu Pejabat') &&
                             canApprove(pj))) && (
                            <button
                              id={`btn-verif-pj-${pj.id}`}
                              onClick={() => openApprovalModal(pj)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded text-[10px] font-black transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                              title="Proses Approval / Verifikasi"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Proses</span>
                            </button>
                          )}
                          
                          {/* Tombol Edit & Hapus Pengajuan */}
                          {(() => {
                            const isAdmin = currentUser?.role === 'Admin';
                            let canManage = isAdmin;
                            if (!isAdmin && currentUser?.role === 'Operator') {
                              if (currentUser.pegawaiId) {
                                const currentUserPegawai = pegawai.find(p => p.id === currentUser.pegawaiId);
                                const pjPegawai = pegawai.find(p => p.id === pj.pegawaiId);
                                if (currentUserPegawai && pjPegawai && currentUserPegawai.unitKerja === pjPegawai.unitKerja) {
                                  canManage = true;
                                }
                              } else {
                                canManage = true;
                              }
                            }

                            if (!canManage) return null;

                            return (
                              <>
                                {/* Edit button: Admin always, or Operator when status allows */}
                                {(isAdmin || (pj.status === 'Menunggu' || pj.status === 'Dalam Perbaikan' || pj.status === 'Sudah Diperbaiki')) && (
                                  <button
                                    id={`btn-edit-pj-${pj.id}`}
                                    onClick={() => openEditModal(pj)}
                                    className="p-1.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-700 border border-gray-200 rounded transition-all cursor-pointer"
                                    title="Edit Pengajuan"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Delete button: Admin always, or Operator when status allows */}
                                {(isAdmin || (pj.status === 'Menunggu' || pj.status === 'Ditolak' || pj.status === 'Dalam Perbaikan' || pj.status === 'Sudah Diperbaiki')) && (
                                  <button
                                    id={`btn-delete-pj-${pj.id}`}
                                    onClick={() => openDeleteConfirm(pj)}
                                    className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-700 border border-gray-200 rounded transition-all cursor-pointer"
                                    title="Hapus Pengajuan"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredPengajuanBase.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* FORM MODAL (ADD PENGAJUAN) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
              <h4 className="text-sm font-bold text-gray-850">
                Formulir Permohonan Cuti Baru ASN
              </h4>
              <button 
                id="close-modal-form-pj"
                onClick={() => setShowFormModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-4">
                
                {/* TANGGAL PENGAJUAN */}
                <div className="col-span-2 md:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Tanggal Pengajuan *</label>
                  <input
                    type="date"
                    required
                    value={formTanggalPengajuan}
                    onChange={(e) => setFormTanggalPengajuan(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>
                
                {/* NOMOR NOTA DINAS PENGAJUAN */}
                <div className="col-span-2 md:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Nomor Nota Dinas Pengajuan Cuti *</label>
                  <input
                    type="text"
                    required
                    value={formNomorSurat}
                    onChange={(e) => setFormNomorSurat(e.target.value)}
                    placeholder="Contoh: 800/012/SETDA/2026"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                  />
                </div>

                {/* 1. DATA PEGAWAI */}
                <h5 className="font-bold text-xs bg-gray-100 p-2 rounded col-span-2 text-gray-700 mt-2">1. DATA PEGAWAI PEMOHON</h5>
                {/* PILIH PEGAWAI */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Pilih Pemohon Cuti *</label>
                  <SearchableSelect
                    disabled={false}
                    value={formPegawaiId}
                    onChange={(val) => setFormPegawaiId(val)}
                    placeholder="-- Pilih Pegawai --"
                    options={pegawai
                      .filter(p => {
                        if (currentUser?.role === 'Operator' && currentUser.pegawaiId) {
                          const cuPegawai = pegawai.find(cp => cp.id === currentUser.pegawaiId);
                          if (cuPegawai && cuPegawai.unitKerja) {
                            return p.unitKerja === cuPegawai.unitKerja;
                          }
                        }
                        return true;
                      })
                      .map(p => ({
                      value: p.id,
                      label: `${p.nama} (${p.jabatan} - ${p.statusPegawai})`
                    }))}
                  />
                </div>

                {/* 2. JENIS DAN LAMA CUTI */}
                <h5 className="font-bold text-xs bg-gray-100 p-2 rounded col-span-2 text-gray-700 mt-2">2. JENIS DAN LAMA CUTI</h5>
                {/* PILIH JENIS CUTI */}
                <div className="col-span-2 md:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Kategori Jenis Cuti *</label>
                  <select
                    required
                    value={formJenisCutiId}
                    onChange={(e) => setFormJenisCutiId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    {filteredJenisCuti.map(jc => (
                      <option key={jc.id} value={jc.id}>{jc.nama} ({jc.kuotaDefault} Hari)</option>
                    ))}
                  </select>
                </div>

                {/* SISA KUOTA INFO */}
                {isCutiTahunanSelected ? (
                  <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold text-[11px] tracking-wide">
                      <Scale className="w-4 h-4" />
                      SISA KUOTA CUTI TAHUNAN ({new Date().getFullYear() - 2}, {new Date().getFullYear() - 1}, {new Date().getFullYear()}):
                    </div>
                    {formPegawaiId ? (() => {
                      const sc = sisaCuti.find(s => s.pegawaiId === formPegawaiId);
                      const sisaN2 = sc?.sisaN2 || 0;
                      const sisaN1 = sc?.sisaN1 || 0;
                      const sisaN = sc?.sisaN || 12;
                      const n = new Date().getFullYear();
                      
                      return (
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-[#FFF9E6] border border-[#FDEB8D] rounded-lg p-3 text-center">
                            <div className="text-[10px] font-bold text-[#A85800] uppercase mb-1">SISA {n - 2}</div>
                            <div className="text-xl font-black text-[#8A4600]">{sisaN2} Hari</div>
                          </div>
                          <div className="bg-[#E6F8F0] border border-[#A6E8C3] rounded-lg p-3 text-center">
                            <div className="text-[10px] font-bold text-[#006037] uppercase mb-1">SISA {n - 1}</div>
                            <div className="text-xl font-black text-[#004729]">{sisaN1} Hari</div>
                          </div>
                          <div className="bg-[#EBF3FF] border border-[#A8C7FA] rounded-lg p-3 text-center">
                            <div className="text-[10px] font-bold text-[#00388F] uppercase mb-1">KUOTA {n}</div>
                            <div className="text-xl font-black text-[#002766]">{sisaN} Hari</div>
                          </div>
                        </div>
                      );
                    })() : (
                      <p className="text-xs text-amber-600 font-medium text-center py-2 bg-amber-50 rounded-lg border border-dashed border-amber-200">
                        Silakan pilih pegawai terlebih dahulu untuk memuat informasi sisa kuota cuti tahunan.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="col-span-2 md:col-span-1 p-3 bg-blue-50 text-[10px] rounded border border-blue-100 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-700 shrink-0" />
                    <p className="text-blue-950">
                      Kategori cuti non-tahunan. Kuota tidak memotong saldo cuti tahunan berjalan.
                    </p>
                  </div>
                )}

                <div className="col-span-2 md:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Tanggal Mulai Cuti *</label>
                  <input
                    type="date"
                    required
                    value={formMulai}
                    onChange={(e) => setFormMulai(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                    {selectedJenisCutiCountsHolidays ? "Jumlah Hari Cuti (Kalender) *" : "Jumlah Hari Cuti (Kerja) *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formHari || ''}
                    onChange={(e) => setFormHari(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    placeholder="Misal: 3"
                  />
                  <p className="text-[9px] text-gray-400">
                    {selectedJenisCutiCountsHolidays 
                      ? "Aturan BKN: Hari libur, cuti bersama, dan sabtu/minggu tetap dihitung." 
                      : "Aturan BKN: Hari libur, cuti bersama, dan sabtu/minggu tidak dihitung."}
                  </p>
                </div>

                {/* DURASI AUTO CALCULATE TANGGAL SELESAI */}
                <div className="col-span-2 p-3 bg-amber-50 text-[11px] rounded border border-amber-100 text-amber-950 font-medium flex items-center justify-between font-mono">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>
                      {selectedJenisCutiCountsHolidays 
                        ? "Perkiraan Tanggal Selesai (Termasuk Libur & Sabtu/Minggu):" 
                        : "Perkiraan Tanggal Selesai (Melewati Libur & Sabtu/Minggu):"}
                    </span>
                  </div>
                  <span className="text-sm font-black bg-amber-200/60 text-amber-950 px-2.5 py-0.5 rounded border border-amber-300">
                    {formSelesai ? formSelesai : '-'}
                  </span>
                </div>

                {/* 3. ALASAN DAN DATA DUKUNG */}
                <h5 className="font-bold text-xs bg-gray-100 p-2 rounded col-span-2 text-gray-700 mt-2">3. ALASAN DAN DATA DUKUNG</h5>
                
                {/* ALASAN CUTI */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Alasan Mengajukan Cuti *</label>
                  <input
                    type="text"
                    required
                    value={formAlasan}
                    onChange={(e) => setFormAlasan(e.target.value)}
                    placeholder="Contoh: Mengikuti wisuda kelulusan anak sulung di Semarang"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* ALAMAT SELAMA CUTI */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Alamat Selama Cuti *</label>
                  <textarea
                    required
                    rows={2}
                    value={formAlamat}
                    onChange={(e) => setFormAlamat(e.target.value)}
                    placeholder="Contoh: Perumahan Graha Tembalang Blok C No. 12, Kota Semarang"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">No. Telp yang Mudah Dihubungi *</label>
                  <input
                    type="text"
                    required
                    value={formNoTelp}
                    onChange={(e) => setFormNoTelp(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Bukti Dukung (PDF/Gambar, Max 2MB)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={isUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          showToast('Ukuran file maksimal 2 MB', 'error');
                          e.target.value = '';
                          return;
                        }
                        
                        setIsUploading(true);
                        try {
                          const fileExt = file.name.split('.').pop();
                          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                          const filePath = `${fileName}`;
                          
                          const { error } = await supabase.storage
                            .from('berkas_cuti')
                            .upload(filePath, file);
                            
                          if (error) throw error;
                          
                          const { data } = supabase.storage
                            .from('berkas_cuti')
                            .getPublicUrl(filePath);
                            
                          setFormBerkasPendukung(data.publicUrl);
                          showToast('Berkas berhasil diunggah', 'success');
                        } catch (error: any) {
                          console.error('Error uploading file:', error);
                          showToast('Gagal mengunggah file: ' + error.message, 'error');
                          e.target.value = '';
                        } finally {
                          setIsUploading(false);
                        }
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  {isUploading && <span className="text-[10px] text-blue-600 font-bold animate-pulse">Mengunggah file...</span>}
                  {formBerkasPendukung && !isUploading && <span className="text-[10px] text-green-600 font-bold">✓ File terpilih dan terunggah</span>}
                </div>

                {/* 4. ATASAN DAN PEJABAT BERWENANG */}
                <h5 className="font-bold text-xs bg-gray-100 p-2 rounded col-span-2 text-gray-700 mt-2">4. ATASAN DAN PEJABAT BERWENANG</h5>
                
                {/* WORKFLOW APPROVAL: PILIH ATASAN LANGSUNG */}
                <div className="col-span-2 md:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Atasan Langsung (Verifikator) *</label>
                  <SearchableSelect
                    value={formAtasanId}
                    onChange={(val) => setFormAtasanId(val)}
                    placeholder="-- Pilih Pegawai --"
                    options={atasanPejabat
                      .filter(ap => (ap.peran === 'Atasan Langsung' || ap.peran === 'Kedua Peran') && ap.statusActive)
                      .map(ap => {
                        const p = pegawai.find(x => x.id === ap.pegawaiId);
                        return p ? {
                          value: p.id,
                          label: `${p.nama} (${p.jabatan})`
                        } : null;
                      })
                      .filter((opt): opt is { value: string; label: string } => opt !== null)}
                  />
                </div>

                {/* WORKFLOW APPROVAL: PILIH PEJABAT PENANDATANGAN */}
                <div className="col-span-2 md:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Pejabat Penanggung Jawab (Sekda/Kabag) *</label>
                  <SearchableSelect
                    value={formPejabatId}
                    onChange={(val) => setFormPejabatId(val)}
                    placeholder="-- Pilih Pegawai --"
                    options={atasanPejabat
                      .filter(ap => (ap.peran === 'Pejabat Penanggung Jawab' || ap.peran === 'Kedua Peran') && ap.statusActive)
                      .map(ap => {
                        const p = pegawai.find(x => x.id === ap.pegawaiId);
                        return p ? {
                          value: p.id,
                          label: `${p.nama} (${p.jabatan})`
                        } : null;
                      })
                      .filter((opt): opt is { value: string; label: string } => opt !== null)}
                  />
                </div>
              </div>

              {/* Ketentuan Metode Penandatanganan */}
              <div className="col-span-2 space-y-2 pt-2 border-t border-gray-100">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Metode Penandatanganan & Legalisasi Dokumen Cuti</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label 
                    onClick={() => {
                      setFormMetodeTtd('TTE');
                      setFormTtdDigitalPemohon(true);
                      setFormTtdDigitalAtasan(true);
                      setFormTtdDigitalPejabat(true);
                    }}
                    className={`p-3 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      formMetodeTtd === 'TTE' 
                        ? 'bg-blue-50/70 border-blue-600 text-blue-950 shadow-xs' 
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="metodePenandatanganan"
                      checked={formMetodeTtd === 'TTE'} 
                      onChange={() => {
                        setFormMetodeTtd('TTE');
                        setFormTtdDigitalPemohon(true);
                        setFormTtdDigitalAtasan(true);
                        setFormTtdDigitalPejabat(true);
                      }}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5 flex-wrap">
                        <span>Full TTE QR Code</span>
                        <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-mono rounded font-semibold">Rekomendasi</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">Menerbitkan QR Code TTE resmi secara otomatis pada lembar cetak untuk Pemohon, Atasan, dan Pejabat.</p>
                    </div>
                  </label>

                  <label 
                    onClick={() => {
                      setFormMetodeTtd('HYBRID');
                      setFormTtdDigitalPemohon(true);
                      setFormTtdDigitalAtasan(false);
                      setFormTtdDigitalPejabat(false);
                    }}
                    className={`p-3 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      formMetodeTtd === 'HYBRID' 
                        ? 'bg-purple-50/70 border-purple-600 text-purple-950 shadow-xs' 
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="metodePenandatanganan"
                      checked={formMetodeTtd === 'HYBRID'} 
                      onChange={() => {
                        setFormMetodeTtd('HYBRID');
                        setFormTtdDigitalPemohon(true);
                        setFormTtdDigitalAtasan(false);
                        setFormTtdDigitalPejabat(false);
                      }}
                      className="mt-0.5 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer" 
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5 flex-wrap">
                        <span>QR Code Pemohon + TTD Basah Atasan/Pejabat</span>
                        <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[9px] font-mono rounded font-semibold">Hybrid</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">QR Code hanya akan diterbitkan untuk Pemohon. Kolom Atasan dan Pejabat dikosongkan untuk tanda tangan basah/fisik.</p>
                    </div>
                  </label>

                  <label 
                    onClick={() => {
                      setFormMetodeTtd('MANUAL');
                      setFormTtdDigitalPemohon(false);
                      setFormTtdDigitalAtasan(false);
                      setFormTtdDigitalPejabat(false);
                    }}
                    className={`p-3 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      formMetodeTtd === 'MANUAL' 
                        ? 'bg-amber-50/70 border-amber-600 text-amber-950 shadow-xs' 
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="metodePenandatanganan"
                      checked={formMetodeTtd === 'MANUAL'} 
                      onChange={() => {
                        setFormMetodeTtd('MANUAL');
                        setFormTtdDigitalPemohon(false);
                        setFormTtdDigitalAtasan(false);
                        setFormTtdDigitalPejabat(false);
                      }}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer" 
                    />
                    <div>
                      <div className="text-xs font-bold">TTD Manual / Basah</div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">Mencetak formulir tanpa QR Code untuk ditandatangani secara fisik / basah oleh pejabat terkait.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  id="btn-batal-form-pj"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-simpan-form-pj"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVAL WORKFLOW ACTION MODAL */}
      {showApprovalModal && selectedPj && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900">
                    {isViewOnlyModal ? 'Rangkuman & Dokumen Pengajuan Cuti ASN' : 'Verifikasi Berkas Pengajuan Cuti ASN'}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium">
                    {isViewOnlyModal ? 'Rangkuman lengkap permohonan cuti, alasan, serta berkas bukti dukung.' : 'Lakukan penelaahan dokumen bukti dukung, alasan, serta sisa kuota sebelum memberi keputusan.'}
                  </p>
                </div>
              </div>
              <button 
                id="close-modal-verif"
                onClick={() => setShowApprovalModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 max-h-[75vh] overflow-y-auto">
              
              {/* Left Pane - Detail Pengajuan (7 cols) */}
              <div className="lg:col-span-7 p-6 space-y-5 overflow-y-auto custom-scrollbar">
                
                {/* Status Timeline Header dalam Modal */}
                <div className="p-3.5 bg-slate-100/80 border border-slate-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">Posisi Tahap Approval:</span>
                    <span className="text-[10px] font-bold text-slate-600 font-mono">
                      Metode: {(() => {
                        const isHybrid = selectedPj.metodePenandatanganan === 'HYBRID' || (selectedPj.ttdDigitalPemohon !== false && selectedPj.ttdDigitalAtasan === false && selectedPj.ttdDigitalPejabat === false);
                        const isTTEFull = selectedPj.metodePenandatanganan === 'TTE' || (!isHybrid && selectedPj.ttdDigitalAtasan !== false && selectedPj.ttdDigitalPejabat !== false);
                        return (
                          <strong className={isTTEFull ? 'text-blue-700' : isHybrid ? 'text-purple-700' : 'text-slate-800'}>
                            {isTTEFull ? 'FULL TTE QR CODE' : isHybrid ? 'HYBRID (QR PEMOHON + TTD BASAH)' : 'TTD MANUAL / BASAH'}
                          </strong>
                        );
                      })()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                    <div className={`p-2 rounded-lg border ${
                      selectedPj.status === 'Menunggu' || selectedPj.status === 'Sudah Diperbaiki' || selectedPj.status === 'Dalam Perbaikan'
                        ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs ring-1 ring-amber-300 font-extrabold'
                        : 'bg-white border-slate-200 text-slate-400 opacity-60'
                    }`}>
                      1. Verifikator
                    </div>
                    <div className={`p-2 rounded-lg border ${
                      selectedPj.status === 'Menunggu Atasan'
                        ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs ring-1 ring-blue-300 font-extrabold'
                        : selectedPj.status === 'Menunggu Pejabat' || selectedPj.status === 'Disetujui'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-400 opacity-60'
                    }`}>
                      2. TTE Atasan Langsung
                    </div>
                    <div className={`p-2 rounded-lg border ${
                      selectedPj.status === 'Menunggu Pejabat'
                        ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs ring-1 ring-purple-300 font-extrabold'
                        : selectedPj.status === 'Disetujui'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-400 opacity-60'
                    }`}>
                      3. TTE Pejabat Final
                    </div>
                  </div>
                </div>

                {/* Bagian 1: Informasi Pemohon */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    Profil Pemohon Cuti
                  </h5>
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/20 border border-slate-100 rounded-xl flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                      {getPegawaiNama(selectedPj.pegawaiId).substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h6 className="font-bold text-sm text-gray-900 leading-tight">{getPegawaiNama(selectedPj.pegawaiId)}</h6>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">NIP. {getPegawaiNip(selectedPj.pegawaiId)}</p>
                      <p className="text-[11px] text-gray-500 font-medium mt-1">Jabatan: {pegawai.find(p => p.id === selectedPj.pegawaiId)?.jabatan || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Bagian 2: Detail Cuti */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    Detail Permohonan & Kategori
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[9px] font-bold text-gray-400 uppercase font-mono block">Kategori Cuti</span>
                      <span className="text-xs font-bold text-gray-800">{getJenisCutiNama(selectedPj.jenisCutiId)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[9px] font-bold text-gray-400 uppercase font-mono block">Nomor Surat</span>
                      <span className="text-xs font-bold text-gray-800 font-mono">{selectedPj.nomorSurat}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[9px] font-bold text-gray-400 uppercase font-mono block">Durasi Pengajuan</span>
                      <span className="text-xs font-bold text-blue-700 font-mono">
                        {selectedPj.jumlahHari} {isHariKalender(selectedPj.jenisCutiId) ? 'Hari Kalender' : 'Hari Kerja'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[9px] font-bold text-gray-400 uppercase font-mono block">Rentang Tanggal</span>
                      <span className="text-xs font-bold text-gray-800 font-mono">{selectedPj.tanggalMulai} s.d {selectedPj.tanggalSelesai}</span>
                    </div>
                  </div>
                </div>

                {/* Bagian 3: Alasan & Kontak */}
                <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase font-mono block">Alasan Pengajuan</span>
                    <p className="text-xs text-gray-700 leading-relaxed font-semibold mt-1">&ldquo;{selectedPj.alasan}&rdquo;</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase font-mono block">No. Telp / HP Hubungi</span>
                      <span className="text-xs font-bold text-gray-700 font-mono block mt-0.5">{selectedPj.noTelpHubungi}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase font-mono block">Alamat Selama Cuti</span>
                      <span className="text-xs font-semibold text-gray-600 block mt-0.5 truncate" title={selectedPj.alamatSelamaCuti}>{selectedPj.alamatSelamaCuti}</span>
                    </div>
                  </div>
                </div>

                {/* Bagian 4: Dynamic Sisa Kuota Cuti Tahunan (Hanya jika Cuti Tahunan terpilih) */}
                {(jenisCuti.find(jc => jc.id === selectedPj.jenisCutiId)?.nama.toLowerCase().includes('tahunan') || selectedPj.jenisCutiId === 'jc-1') && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200/60 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3 text-amber-950 font-bold text-[11px] tracking-wide">
                      <Scale className="w-4 h-4 text-amber-600" />
                      <span>SISA KUOTA CUTI TAHUNAN ASN ({new Date().getFullYear() - 2}, {new Date().getFullYear() - 1}, {new Date().getFullYear()}):</span>
                    </div>
                    {(() => {
                      const sc = sisaCuti.find(s => s.pegawaiId === selectedPj.pegawaiId);
                      const sisaN2 = sc?.sisaN2 || 0;
                      const sisaN1 = sc?.sisaN1 || 0;
                      const sisaN = sc?.sisaN || 0;
                      const totalTersedia = hitungTotalCutiTahunan(sc);

                      return (
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="bg-white border border-amber-100 rounded-lg p-2 shadow-xs">
                            <div className="text-[9px] font-bold text-gray-400 font-mono">N-2 ({new Date().getFullYear() - 2})</div>
                            <div className="text-sm font-black text-amber-700 font-mono mt-0.5">{sisaN2} hr</div>
                          </div>
                          <div className="bg-white border border-amber-100 rounded-lg p-2 shadow-xs">
                            <div className="text-[9px] font-bold text-gray-400 font-mono">N-1 ({new Date().getFullYear() - 1})</div>
                            <div className="text-sm font-black text-amber-700 font-mono mt-0.5">{sisaN1} hr</div>
                          </div>
                          <div className="bg-white border border-amber-100 rounded-lg p-2 shadow-xs">
                            <div className="text-[9px] font-bold text-gray-400 font-mono">N ({new Date().getFullYear()})</div>
                            <div className="text-sm font-black text-amber-700 font-mono mt-0.5">{sisaN} hr</div>
                          </div>
                          <div className="bg-blue-600 border border-blue-700 rounded-lg p-2 text-white shadow-sm flex flex-col justify-center">
                            <div className="text-[8px] font-black uppercase font-mono opacity-90 leading-tight">Sisa Kuota Tersedia</div>
                            <div className="text-xs font-black font-mono mt-0.5">{totalTersedia} Hari</div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Form Input Catatan/Revisi & Decision Buttons (Hanya jika BUKAN View-Only) */}
                {!isViewOnlyModal ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Tulis Catatan Verifikator / Alasan Perbaikan / Alasan Penolakan</label>
                      <textarea
                        rows={3}
                        value={appCatatan}
                        onChange={(e) => setAppCatatan(e.target.value)}
                        placeholder="Wajib diisi jika Anda menolak (Ditolak) atau meminta perbaikan dokumen (Dalam Perbaikan). Opsional jika disetujui..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 font-medium"
                      />
                    </div>

                    {/* Decision Buttons inside detail panel */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                      <button
                        id="btn-verif-tolak"
                        onClick={() => handleApprovalAction('Ditolak')}
                        className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Ban className="w-4 h-4" />
                        <span>Tolak</span>
                      </button>
                      <button
                        id="btn-verif-revisi"
                        onClick={() => handleApprovalAction('Dalam Perbaikan')}
                        className="px-3 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <RefreshCw className="w-4 h-4 animate-spin-hover" />
                        <span>Revisi</span>
                      </button>
                      <button
                        id="btn-verif-setuju"
                        onClick={() => handleApprovalAction('Disetujui')}
                        className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg"
                      >
                        <Check className="w-4 h-4" />
                        <span>Setujui</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 pt-2">
                    {selectedPj.catatanPerbaikan && (
                      <div className="p-3.5 bg-rose-50/90 border border-rose-200 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-rose-600 uppercase font-mono block">
                          Catatan Verifikator / Alasan Perbaikan/Penolakan:
                        </span>
                        <p className="text-xs font-semibold text-rose-900 leading-relaxed">&ldquo;{selectedPj.catatanPerbaikan}&rdquo;</p>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-100 flex justify-end">
                      <button
                        id="btn-close-detail-modal"
                        onClick={() => setShowApprovalModal(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        Tutup Pratinjau
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Right Pane - Real-Time Attachment Preview (5 cols) */}
              <div className="lg:col-span-5 p-6 bg-slate-50/50 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-3 flex-1 flex flex-col">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5 text-teal-600" />
                      Pratinjau Bukti Dukung (Lampiran)
                    </span>
                    {selectedPj.berkasPendukung && (
                      <a 
                        href={selectedPj.berkasPendukung} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 font-bold text-[10px] flex items-center gap-0.5 hover:underline"
                      >
                        <span>Buka Tab Baru</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </h5>

                  {/* Preview Container */}
                  <div className="flex-1 min-h-[350px] lg:min-h-[420px] bg-white border border-slate-200/80 rounded-xl p-2 shadow-inner flex flex-col items-center justify-center overflow-hidden">
                    {selectedPj.berkasPendukung ? (() => {
                      const lowerUrl = selectedPj.berkasPendukung.toLowerCase().split('?')[0];
                      const isPdf = lowerUrl.endsWith('.pdf');
                      const isImage = lowerUrl.endsWith('.png') || lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.webp') || lowerUrl.endsWith('.gif');

                      if (isPdf) {
                        return (
                          <iframe 
                            src={`${selectedPj.berkasPendukung}#toolbar=0`} 
                            className="w-full h-full rounded-lg border-0 bg-slate-100"
                            title="Pratinjau PDF Bukti Dukung"
                          />
                        );
                      } else if (isImage) {
                        return (
                          <div className="relative w-full h-full flex items-center justify-center p-2">
                            <img 
                              src={selectedPj.berkasPendukung} 
                              alt="Bukti Dukung" 
                              className="max-w-full max-h-[380px] object-contain rounded-lg shadow-sm hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        );
                      } else {
                        // Fallback browser viewer or object wrapper
                        return (
                          <div className="text-center p-6 space-y-3">
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-200">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-800">Format file tidak didukung pratinjau langsung</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">Silakan unduh atau buka tautan di bawah ini untuk menelaah dokumen.</p>
                            </div>
                            <a 
                              href={selectedPj.berkasPendukung} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-1 bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-all"
                            >
                              <Download className="w-3 h-3" />
                              <span>Unduh Berkas Pendukung</span>
                            </a>
                          </div>
                        );
                      }
                    })() : (
                      // Empty state for attachment
                      <div className="text-center p-8 space-y-3 text-slate-400">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mx-auto border border-dashed border-slate-200">
                          <Paperclip className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-600">Tidak Ada Dokumen Terlampir</p>
                          <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                            Pemohon cuti ini tidak melampirkan berkas bukti dukung fisik (seperti surat sakit, rujukan dokter, atau undangan dinas).
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer notes */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 leading-normal flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>Sesuai Perbup Demak & Peraturan BKN No. 5/2017, verifikasi berkas bukti dukung bersifat mutlak terutama pada pengajuan Cuti Sakit, Melahirkan, CAP, dan Cuti Besar.</span>
                </div>
              </div>

            </div>
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
                <h4 className="text-sm font-bold text-gray-900">Batalkan Pengajuan Cuti</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Apakah Anda yakin ingin membatalkan dan menghapus permanen pengajuan cuti nomor <strong className="text-gray-800">{selectedPj?.nomorSurat}</strong>? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                id="btn-batal-delete-pj"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-ya-delete-pj"
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

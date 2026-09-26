'use client';

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Trash2, 
  Search, 
  Edit2, 
  X, 
  History, 
  Info, 
  Download, 
  Upload, 
  Layers, 
  Calendar, 
  User, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Building2,
  Filter,
  Scale,
  BookOpen,
  ShieldCheck,
  Check,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { SisaCutiTahunan, Pegawai, PengaturanUser, JenisCuti, PengajuanCuti, SisaKuotaDetail } from '../lib/types';
import { REGULASI_PENGURANGAN_CUTI_BKN, getAturanCuti, AturanPenguranganCuti } from '../lib/regulasiCuti';
import { useToast } from '../lib/ToastContext';
import Pagination from './Pagination';

interface SisaCutiViewProps {
  sisaCuti: SisaCutiTahunan[];
  pegawai: Pegawai[];
  jenisCuti?: JenisCuti[];
  pengajuan?: PengajuanCuti[];
  addSisaCuti: (sc: Omit<SisaCutiTahunan, 'id'>) => Promise<void>;
  updateSisaCuti: (id: string, sc: Partial<SisaCutiTahunan>) => Promise<void>;
  deleteSisaCuti: (id: string) => Promise<void>;
  generateSisaCutiNextYear: () => Promise<void>;
  hitungTotalCutiTahunan: (sc: SisaCutiTahunan | undefined) => number;
  hitungSisaKuotaJenisCuti?: (pegawaiId: string, jenisCutiId: string, tahun?: number, excludePengajuanId?: string) => SisaKuotaDetail;
  dapatkanSemuaSisaKuotaPegawai?: (pegawaiId: string, tahun?: number, excludePengajuanId?: string) => SisaKuotaDetail[];
  currentUser?: PengaturanUser | null;
}

export default function SisaCutiView({ 
  sisaCuti, 
  pegawai, 
  jenisCuti = [], 
  pengajuan = [],
  addSisaCuti, 
  updateSisaCuti, 
  deleteSisaCuti, 
  generateSisaCutiNextYear, 
  hitungTotalCutiTahunan, 
  hitungSisaKuotaJenisCuti,
  dapatkanSemuaSisaKuotaPegawai,
  currentUser 
}: SisaCutiViewProps) {
  const { showToast } = useToast();
  const isAdmin = currentUser?.role === 'Admin';
  
  // Tab State: 'semua_jenis' | 'akumulasi_tahunan' | 'sistem_pengurangan'
  const [activeTab, setActiveTab] = useState<'semua_jenis' | 'akumulasi_tahunan' | 'sistem_pengurangan'>('semua_jenis');

  // Global filters
  const currentYearNow = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYearNow);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnitKerja, setFilterUnitKerja] = useState('Semua');
  const [filterStatusPegawai, setFilterStatusPegawai] = useState('Semua');

  // Filter for Regulasi Tab
  const [filterPengaruhCuti, setFilterPengaruhCuti] = useState('Semua');
  const [searchRegulasi, setSearchRegulasi] = useState('');
  const [selectedRegulasiModal, setSelectedRegulasiModal] = useState<AturanPenguranganCuti | null>(null);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSisa, setSelectedSisa] = useState<SisaCutiTahunan | null>(null);
  const [selectedPegawaiDetail, setSelectedPegawaiDetail] = useState<Pegawai | null>(null);

  // Form States for Cuti Tahunan Edit/Add
  const [sisaN2, setSisaN2] = useState<number>(0);
  const [sisaN1, setSisaN1] = useState<number>(0);
  const [sisaN, setSisaN] = useState<number>(12);
  const [addPegawaiId, setAddPegawaiId] = useState<string>('');
  const [addTahunN, setAddTahunN] = useState<number>(currentYearNow);
  
  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Pagination for Tab 1
  const [pageSemua, setPageSemua] = useState(1);
  const itemsPerPageSemua = 10;

  // Pagination for Tab 2
  const [pageTahunan, setPageTahunan] = useState(1);
  const itemsPerPageTahunan = 10;

  // Available Unit Kerja list for filtering
  const unitKerjaList = useMemo(() => {
    const units = Array.from(new Set(pegawai.map(p => p.unitKerja).filter(Boolean)));
    return units.sort();
  }, [pegawai]);

  const getPegawaiDetail = (pegawaiId: string) => {
    return pegawai.find(p => p.id === pegawaiId);
  };

  // Helper calculation if not passed in props
  const getSisaKuota = (pegawaiId: string, jcId: string, tahun: number): SisaKuotaDetail => {
    if (hitungSisaKuotaJenisCuti) {
      return hitungSisaKuotaJenisCuti(pegawaiId, jcId, tahun);
    }
    const jc = jenisCuti.find(j => j.id === jcId);
    if (!jc) {
      return { jenisCutiId: jcId, namaJenis: 'Cuti', kuotaAwal: 0, terpakai: 0, sisa: 0, satuan: 'Hari Kerja' };
    }
    const isTahunan = jc.nama.toLowerCase().includes('tahunan') || jc.id === 'jc-1';
    const isBesar = jc.nama.toLowerCase().includes('besar');
    const isHariKerja = isTahunan || jc.nama.toLowerCase().includes('alasan penting') || jc.nama.toLowerCase().includes('penting');
    const satuan = (!isHariKerja) ? ('Hari Kalender' as const) : ('Hari Kerja' as const);

    const disetujui = pengajuan.filter(pj => {
      if (pj.pegawaiId !== pegawaiId || pj.jenisCutiId !== jcId || pj.status !== 'Disetujui') return false;
      const pjYear = pj.tanggalMulai ? new Date(pj.tanggalMulai).getFullYear() : tahun;
      return pjYear === tahun;
    });
    const terpakai = disetujui.reduce((acc, curr) => acc + (curr.jumlahHari || 0), 0);

    const jcBesar = jenisCuti.find(j => j.nama.toLowerCase().includes('besar'));
    const hasCutiBesarThisYear = jcBesar ? pengajuan.some(pj => {
      if (pj.pegawaiId !== pegawaiId || pj.jenisCutiId !== jcBesar.id || pj.status !== 'Disetujui') return false;
      const pjYear = pj.tanggalMulai ? new Date(pj.tanggalMulai).getFullYear() : tahun;
      return pjYear === tahun;
    }) : false;

    const jcTahunan = jenisCuti.find(j => j.nama.toLowerCase().includes('tahunan') || j.id === 'jc-1');
    const hariCutiTahunanTerpakai = jcTahunan ? pengajuan.filter(pj => {
      if (pj.pegawaiId !== pegawaiId || pj.jenisCutiId !== jcTahunan.id || pj.status !== 'Disetujui') return false;
      const pjYear = pj.tanggalMulai ? new Date(pj.tanggalMulai).getFullYear() : tahun;
      return pjYear === tahun;
    }).reduce((acc, curr) => acc + (curr.jumlahHari || 0), 0) : 0;

    if (isTahunan) {
      if (hasCutiBesarThisYear) {
        return {
          jenisCutiId: jc.id,
          namaJenis: jc.nama,
          kuotaAwal: 0,
          terpakai,
          sisa: 0,
          satuan,
          hasCutiBesarThisYear: true,
          keterangan: `Hak Cuti Tahunan gugur karena mengambil Cuti Besar pada tahun ${tahun}.`
        };
      }
      const sc = sisaCuti.find(s => s.pegawaiId === pegawaiId);
      const totalSisa = hitungTotalCutiTahunan(sc);
      return {
        jenisCutiId: jc.id,
        namaJenis: jc.nama,
        kuotaAwal: totalSisa + terpakai,
        terpakai,
        sisa: totalSisa,
        satuan,
        hasCutiBesarThisYear: false,
        keterangan: sc ? `N-2: ${sc.sisaN2}, N-1: ${sc.sisaN1}, N: ${sc.sisaN}` : 'Default 12 hari'
      };
    } else if (isBesar) {
      const baseKuota = jc.kuotaDefault || 90;
      const kuotaDisesuaikan = Math.max(0, baseKuota - hariCutiTahunanTerpakai);
      const isBesarSudahDiambil = hasCutiBesarThisYear || terpakai > 0;
      const sisa = isBesarSudahDiambil ? 0 : kuotaDisesuaikan;

      let ket = 'Maksimal 90 hari kalender. Hanya dapat diambil 1 (satu) kali dalam 1 tahun berjalan.';
      if (isBesarSudahDiambil) {
        ket = `TIDAK DAPAT DIAMBIL LAGI: Pegawai telah mengambil Cuti Besar sebanyak ${terpakai} hari pada tahun ${tahun}. Sesuai ketentuan BKN, Cuti Besar hanya dapat diambil 1 kali setahun (sisa kuota hangus).`;
      } else if (hariCutiTahunanTerpakai > 0) {
        ket = `Kuota awal (90 hari) dipotong ${hariCutiTahunanTerpakai} hari Cuti Tahunan yang telah diambil pada tahun berjalan. Sisa tersedia: ${sisa} hari.`;
      }

      return {
        jenisCutiId: jc.id,
        namaJenis: jc.nama,
        kuotaAwal: kuotaDisesuaikan,
        terpakai,
        sisa,
        satuan,
        hasCutiBesarThisYear: isBesarSudahDiambil,
        isBesarSudahDiambil,
        hariCutiTahunanTerpakai,
        kuotaDisesuaikan,
        keterangan: ket
      };
    } else {
      const kuotaAwal = jc.kuotaDefault || 0;
      const sisa = Math.max(0, kuotaAwal - terpakai);
      return {
        jenisCutiId: jc.id,
        namaJenis: jc.nama,
        kuotaAwal,
        terpakai,
        sisa,
        satuan,
        keterangan: jc.keterangan || `Maksimal ${kuotaAwal} hari/tahun`
      };
    }
  };

  // Data for Tab 1: All Leave Types Quota per Employee
  const semuaJenisData = useMemo(() => {
    return pegawai
      .filter(p => {
        // Unit Kerja Filter
        if (filterUnitKerja !== 'Semua' && p.unitKerja !== filterUnitKerja) return false;
        // Status Pegawai Filter
        if (filterStatusPegawai !== 'Semua' && p.statusPegawai !== filterStatusPegawai) return false;
        // Search Term Filter
        if (searchTerm) {
          const s = searchTerm.toLowerCase();
          const match = p.nama.toLowerCase().includes(s) || p.nip.includes(s) || (p.jabatan && p.jabatan.toLowerCase().includes(s));
          if (!match) return false;
        }
        return true;
      })
      .map(p => {
        const kuotaDetails: { [key: string]: SisaKuotaDetail } = {};
        let totalTerpakaiSemua = 0;
        
        jenisCuti.forEach(jc => {
          const detail = getSisaKuota(p.id, jc.id, selectedYear);
          kuotaDetails[jc.id] = detail;
          totalTerpakaiSemua += detail.terpakai;
        });

        return {
          pegawai: p,
          kuotaDetails,
          totalTerpakaiSemua
        };
      });
  }, [pegawai, jenisCuti, pengajuan, sisaCuti, selectedYear, filterUnitKerja, filterStatusPegawai, searchTerm]);

  const totalPagesSemua = Math.ceil(semuaJenisData.length / itemsPerPageSemua) || 1;
  const pagedSemuaJenis = semuaJenisData.slice((pageSemua - 1) * itemsPerPageSemua, pageSemua * itemsPerPageSemua);

  // Data for Tab 2: Tahunan Only
  const filteredSisaBase = useMemo(() => {
    return sisaCuti.filter(sc => {
      const p = getPegawaiDetail(sc.pegawaiId);
      if (!p) return false;
      if (filterUnitKerja !== 'Semua' && p.unitKerja !== filterUnitKerja) return false;
      if (filterStatusPegawai !== 'Semua' && p.statusPegawai !== filterStatusPegawai) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        return p.nama.toLowerCase().includes(s) || p.nip.includes(s) || p.unitKerja.toLowerCase().includes(s);
      }
      return true;
    });
  }, [sisaCuti, pegawai, filterUnitKerja, filterStatusPegawai, searchTerm]);

  const totalPagesTahunan = Math.ceil(filteredSisaBase.length / itemsPerPageTahunan) || 1;
  const filteredSisaTahunan = filteredSisaBase.slice((pageTahunan - 1) * itemsPerPageTahunan, pageTahunan * itemsPerPageTahunan);

  // Statistics Summary
  const stats = useMemo(() => {
    const totalPeg = pegawai.length;
    let totalCutiDisetujuiTahunIni = 0;
    pengajuan.forEach(pj => {
      if (pj.status === 'Disetujui' && pj.tanggalMulai) {
        const year = new Date(pj.tanggalMulai).getFullYear();
        if (year === selectedYear) {
          totalCutiDisetujuiTahunIni += pj.jumlahHari || 0;
        }
      }
    });

    return {
      totalPeg,
      totalCutiDisetujuiTahunIni
    };
  }, [pegawai, pengajuan, selectedYear]);

  // Filtered Regulasi BKN for Tab 3
  const filteredRegulasi = useMemo(() => {
    return REGULASI_PENGURANGAN_CUTI_BKN.filter(reg => {
      if (filterPengaruhCuti !== 'Semua' && reg.pengaruhCutiTahunan !== filterPengaruhCuti) return false;
      if (searchRegulasi) {
        const s = searchRegulasi.toLowerCase();
        const match = reg.namaJenis.toLowerCase().includes(s) ||
          reg.singkatan.toLowerCase().includes(s) ||
          reg.sistemPengurangan.toLowerCase().includes(s) ||
          reg.dasarHukum.toLowerCase().includes(s) ||
          reg.poinPenting.some(p => p.toLowerCase().includes(s));
        if (!match) return false;
      }
      return true;
    });
  }, [filterPengaruhCuti, searchRegulasi]);

  // Actions
  const openEditModal = (sc: SisaCutiTahunan) => {
    setSelectedSisa(sc);
    setSisaN2(sc.sisaN2);
    setSisaN1(sc.sisaN1);
    setSisaN(sc.sisaN);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSisa) {
      updateSisaCuti(selectedSisa.id, {
        sisaN2: Number(sisaN2),
        sisaN1: Number(sisaN1),
        sisaN: Number(sisaN)
      });
      showToast('Saldo cuti tahunan berhasil disesuaikan.', 'success');
      setShowModal(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addPegawaiId) {
      showToast('Pilih pegawai terlebih dahulu!', 'error');
      return;
    }
    await addSisaCuti({
      pegawaiId: addPegawaiId,
      sisaN2: Number(sisaN2),
      sisaN1: Number(sisaN1),
      sisaN: Number(sisaN),
      tahunN: addTahunN
    });
    showToast('Saldo cuti berhasil ditambahkan.', 'success');
    setShowAddModal(false);
  };

  const handleExportTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { NIP: '198501012010011001', Nama: 'John Doe', 'Sisa N-2': 0, 'Sisa N-1': 0, 'Sisa N': 12 }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Sisa_Cuti");
    XLSX.writeFile(wb, "template_sisa_cuti_tahunan.xlsx");
  };

  const handleExportRekapSemuaJenis = () => {
    const exportData = semuaJenisData.map((item, idx) => {
      const row: any = {
        No: idx + 1,
        NIP: item.pegawai.nip,
        Nama: item.pegawai.nama,
        Jabatan: item.pegawai.jabatan,
        'Unit Kerja': item.pegawai.unitKerja,
        'Status ASN': item.pegawai.statusPegawai
      };

      jenisCuti.forEach(jc => {
        const detail = item.kuotaDetails[jc.id];
        if (detail) {
          row[`${jc.nama} (Sisa / Kuota)`] = `${detail.sisa} / ${detail.kuotaAwal} ${detail.satuan}`;
          row[`${jc.nama} (Terpakai)`] = detail.terpakai;
        }
      });

      row[`Total Cuti Diambil (${selectedYear})`] = item.totalTerpakaiSemua;
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Rekap_Kuota_${selectedYear}`);
    XLSX.writeFile(wb, `rekap_sisa_kuota_semua_jenis_cuti_${selectedYear}.xlsx`);
    showToast(`Rekap sisa kuota semua jenis cuti tahun ${selectedYear} berhasil diekspor.`, 'success');
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
          
          let insertCount = 0;
          let updateCount = 0;
          const currentYear = new Date().getFullYear();

          for (const row of data as any[]) {
            if (row.NIP) {
              const nipStr = String(row.NIP).trim().replace(/\s/g, '');
              const pg = pegawai.find(p => p.nip.trim().replace(/\s/g, '') === nipStr);
              if (pg) {
                const sc = sisaCuti.find(s => s.pegawaiId === pg.id && s.tahunN === currentYear);
                
                const sisaN2Val = row['Sisa N-2'] !== undefined ? Number(row['Sisa N-2']) : (sc ? sc.sisaN2 : 0);
                const sisaN1Val = row['Sisa N-1'] !== undefined ? Number(row['Sisa N-1']) : (sc ? sc.sisaN1 : 0);
                const sisaNVal = row['Sisa N'] !== undefined ? Number(row['Sisa N']) : (sc ? sc.sisaN : 12);

                if (sc) {
                  await updateSisaCuti(sc.id, {
                    sisaN2: sisaN2Val,
                    sisaN1: sisaN1Val,
                    sisaN: sisaNVal
                  });
                  updateCount++;
                } else {
                  await addSisaCuti({
                    pegawaiId: pg.id,
                    sisaN2: sisaN2Val,
                    sisaN1: sisaN1Val,
                    sisaN: sisaNVal,
                    tahunN: currentYear
                  });
                  insertCount++;
                }
              }
            }
          }
          showToast(`Berhasil mengimpor sisa cuti: ${insertCount} data baru ditambahkan, ${updateCount} data diperbarui.`, 'success');
        } catch (err: any) {
          console.error(err);
          showToast(`Gagal membaca file Excel: ${err.message || err}`, 'error');
        }
      };
      reader.readAsArrayBuffer(file);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Manajemen Sisa Kuota Cuti Pegawai</span>
          </h3>
          <p className="text-xs text-gray-500">
            Monitoring sisa kuota dan pemakaian seluruh jenis cuti ASN dalam satu tahun berjalan serta pengelolaan akumulasi Cuti Tahunan BKN (N, N-1, N-2).
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'semua_jenis' && (
            <button
              onClick={handleExportRekapSemuaJenis}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all text-xs font-bold shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Rekap Kuota (Excel)</span>
            </button>
          )}

          {activeTab === 'akumulasi_tahunan' && isAdmin && (
            <>
              <button 
                onClick={() => {
                  setAddPegawaiId('');
                  setSisaN2(0);
                  setSisaN1(0);
                  setSisaN(12);
                  setAddTahunN(currentYearNow);
                  setShowAddModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs font-bold shadow-sm cursor-pointer"
              >
                + Tambah Saldo
              </button>
              
              <button 
                onClick={async () => {
                  if (confirm('Apakah Anda yakin ingin men-generate saldo cuti tahunan berjalan (default 12 hari) untuk pegawai yang belum memilikinya?')) {
                    try {
                      await generateSisaCutiNextYear();
                      showToast('Proses generate saldo cuti berhasil.', 'success');
                    } catch (e: any) {
                      showToast(`Gagal generate saldo: ${e.message || e}`, 'error');
                    }
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-all text-xs font-bold cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                Generate Saldo N
              </button>
              
              <button 
                onClick={handleExportTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-xs font-medium cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Template
              </button>
              
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-xs font-medium cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Import Excel
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  className="hidden" 
                  onChange={handleImportData}
                />
              </label>
            </>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-3 gap-2">
        <button
          onClick={() => setActiveTab('semua_jenis')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'semua_jenis'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Sisa Kuota Semua Jenis Cuti ({selectedYear})</span>
          <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-black">
            {jenisCuti.length} Jenis
          </span>
        </button>

        <button
          onClick={() => setActiveTab('akumulasi_tahunan')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'akumulasi_tahunan'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Akumulasi Cuti Tahunan (N, N-1, N-2)</span>
          <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
            Aturan BKN
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sistem_pengurangan')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'sistem_pengurangan'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Scale className="w-4 h-4 text-emerald-600" />
          <span>Sistem Pengurangan Kuota & Regulasi BKN</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black">
            Identifikasi Regulasi
          </span>
        </button>
      </div>

      {/* Filter & Toolbar */}
      {activeTab === 'sistem_pengurangan' ? (
        <div className="bg-white p-4 rounded-b-xl rounded-t-none border border-t-0 border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 -mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-700 font-bold">Filter Pengaruh ke Cuti Tahunan:</span>
              <select
                value={filterPengaruhCuti}
                onChange={(e) => setFilterPengaruhCuti(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Semua">Semua Pengaruh (Semua Jenis Cuti)</option>
                <option value="Mengurangi Cuti Tahunan">Mengurangi Cuti Tahunan</option>
                <option value="Tidak Mengurangi Cuti Tahunan">Tidak Mengurangi Cuti Tahunan</option>
                <option value="Menghilangkan Hak Cuti Tahunan">Menghilangkan Hak Cuti Tahunan</option>
              </select>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari jenis cuti, aturan BKN, atau dasar hukum..."
              value={searchRegulasi}
              onChange={(e) => setSearchRegulasi(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-b-xl rounded-t-none border border-t-0 border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 -mt-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Year selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-bold">Tahun Acuan:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-700 focus:outline-none focus:border-blue-500 font-mono cursor-pointer"
              >
                {[currentYearNow - 2, currentYearNow - 1, currentYearNow, currentYearNow + 1].map(yr => (
                  <option key={yr} value={yr}>{yr} {yr === currentYearNow ? '(Tahun Berjalan)' : ''}</option>
                ))}
              </select>
            </div>

            {/* Unit Kerja Filter */}
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={filterUnitKerja}
                onChange={(e) => {
                  setFilterUnitKerja(e.target.value);
                  setPageSemua(1);
                  setPageTahunan(1);
                }}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer max-w-[180px]"
              >
                <option value="Semua">Semua Unit Kerja</option>
                {unitKerjaList.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* Status Pegawai Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={filterStatusPegawai}
                onChange={(e) => {
                  setFilterStatusPegawai(e.target.value);
                  setPageSemua(1);
                  setPageTahunan(1);
                }}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Semua">Semua Status ASN</option>
                <option value="PNS">PNS</option>
                <option value="PPPK">PPPK</option>
                <option value="PPPK PW">PPPK PW</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama atau NIP pegawai..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPageSemua(1);
                setPageTahunan(1);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      )}

      {/* TAB 1: SISA KUOTA SEMUA JENIS CUTI */}
      {activeTab === 'semua_jenis' && (
        <div className="space-y-4">
          {/* Info Card Seluruh Jenis Cuti */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-blue-900">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-blue-950">Informasi Perhitungan Sisa Kuota Seluruh Jenis Cuti (Tahun {selectedYear}):</p>
                <p className="text-blue-800 leading-relaxed">
                  Sisa kuota masing-masing jenis cuti dihitung otomatis dari <strong>Kuota Standar Per Tahun</strong> dikurangi total <strong>Hari Cuti yang Telah Disetujui</strong> pada tahun tersebut. Khusus Cuti Tahunan memperhitungkan akumulasi sisa N, N-1, dan N-2. Klik ikon timbangan pada header kolom untuk melihat tata cara pemotongan saldo sesuai regulasi BKN.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab('sistem_pengurangan')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="Buka Halaman Panduan Sistem Pengurangan Kuota Cuti BKN"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Sistem Pengurangan Kuota</span>
              </button>

              <div className="flex items-center gap-3 bg-white/80 border border-blue-200/60 px-3.5 py-1.5 rounded-lg">
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Total Pegawai</div>
                  <div className="text-sm font-black text-gray-900">{stats.totalPeg}</div>
                </div>
                <div className="h-5 w-px bg-gray-200" />
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Cuti Disetujui ({selectedYear})</div>
                  <div className="text-sm font-black text-blue-700">{stats.totalCutiDisetujuiTahunIni} Hari</div>
                </div>
              </div>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3.5 w-12 text-center">No</th>
                    <th className="p-3.5 min-w-[220px]">Pegawai & Unit Kerja</th>
                    {jenisCuti.map(jc => {
                      const aturan = getAturanCuti(jc.nama);
                      return (
                        <th key={jc.id} className="p-3.5 text-center min-w-[135px] border-l border-slate-200/60">
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-bold text-slate-800 line-clamp-1" title={jc.nama}>{jc.nama}</span>
                            {aturan && (
                              <button
                                onClick={() => setSelectedRegulasiModal(aturan)}
                                className="text-blue-500 hover:text-blue-700 p-0.5 rounded hover:bg-blue-100 cursor-pointer"
                                title={`Pelajari Aturan Pengurangan Kuota ${jc.nama} (BKN)`}
                              >
                                <Scale className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="text-[10px] font-normal text-slate-500">
                            Kuota: {jc.kuotaDefault} {aturan?.satuanHari === 'Hari Kalender' ? 'HK' : 'Hari'}
                          </div>
                          {aturan && (
                            <div className="mt-1">
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                aturan.pengaruhCutiTahunan === 'Mengurangi Cuti Tahunan'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : aturan.pengaruhCutiTahunan === 'Menghilangkan Hak Cuti Tahunan'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {aturan.pengaruhCutiTahunan === 'Mengurangi Cuti Tahunan' ? 'Potong Tahunan' : aturan.pengaruhCutiTahunan === 'Menghilangkan Hak Cuti Tahunan' ? 'Nolkan Tahunan' : 'Bebas Tahunan'}
                              </span>
                            </div>
                          )}
                        </th>
                      );
                    })}
                    <th className="p-3.5 text-center bg-blue-50/60 border-l border-blue-200 min-w-[100px]">
                      Total Terpakai
                    </th>
                    <th className="p-3.5 text-center w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {semuaJenisData.length === 0 ? (
                    <tr>
                      <td colSpan={jenisCuti.length + 4} className="p-8 text-center text-gray-400">
                        Tidak ada data pegawai yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    pagedSemuaJenis.map((item, idx) => {
                      const p = item.pegawai;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-all">
                          <td className="p-3.5 font-mono text-gray-400 text-center">
                            {(pageSemua - 1) * itemsPerPageSemua + idx + 1}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-gray-900">{p.nama}</div>
                            <div className="text-[10px] text-gray-500 font-mono">
                              NIP. {p.nip} • <span className="font-bold text-blue-700">{p.statusPegawai}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 truncate max-w-[200px]">
                              {p.unitKerja}
                            </div>
                          </td>

                          {jenisCuti.map(jc => {
                            const detail = item.kuotaDetails[jc.id];
                            if (!detail) return <td key={jc.id} className="p-3.5 text-center">-</td>;
                            
                            const isCutiBesarItem = jc.nama.toLowerCase().includes('besar') || jc.id === 'jc-5';
                            const isTahunanItem = jc.nama.toLowerCase().includes('tahunan') || jc.id === 'jc-1';

                            const isExhausted = detail.sisa === 0 && detail.kuotaAwal > 0;
                            const isZeroQuota = detail.kuotaAwal === 0;

                            return (
                              <td key={jc.id} className="p-3 text-center border-l border-slate-100">
                                <div className="inline-flex flex-col items-center">
                                  {isTahunanItem && detail.hasCutiBesarThisYear ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200" title="Hak Cuti Tahunan Gugur karena telah mengambil Cuti Besar pada tahun ini">
                                      Gugur (Cuti Besar)
                                    </span>
                                  ) : isCutiBesarItem && (detail.isBesarSudahDiambil || detail.terpakai > 0) ? (
                                    <div className="inline-flex flex-col items-center">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200" title={`Pegawai telah mengambil Cuti Besar pada tahun ${selectedYear}. Sesuai ketentuan BKN, Cuti Besar hanya dapat diambil 1 kali dalam setahun (sisa kuota hangus).`}>
                                        Sudah Diambil 1x
                                      </span>
                                      <span className="text-[9px] text-rose-700 font-semibold mt-0.5">
                                        Terpakai: {detail.terpakai} hr (Sisa: 0)
                                      </span>
                                    </div>
                                  ) : (
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${
                                      isZeroQuota
                                        ? 'bg-gray-50 text-gray-400 border-gray-200'
                                        : isExhausted
                                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                                          : detail.terpakai > 0
                                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    }`}>
                                      {detail.sisa} <span className="text-[10px] font-normal text-gray-500">/ {detail.kuotaAwal}</span>
                                    </span>
                                  )}
                                  {detail.terpakai > 0 && !detail.hasCutiBesarThisYear && !isCutiBesarItem && (
                                    <span className="text-[9px] text-amber-700 font-medium mt-0.5">
                                      Terpakai: {detail.terpakai}
                                    </span>
                                  )}
                                  {detail.hariCutiTahunanTerpakai && detail.hariCutiTahunanTerpakai > 0 && isCutiBesarItem && !detail.isBesarSudahDiambil && detail.terpakai === 0 ? (
                                    <span className="text-[9px] text-blue-700 font-medium mt-0.5" title={`Kuota awal dipotong ${detail.hariCutiTahunanTerpakai} hari dari Cuti Tahunan yang telah diambil`}>
                                      Dipotong {detail.hariCutiTahunanTerpakai} hr (Tahunan)
                                    </span>
                                  ) : null}
                                </div>
                              </td>
                            );
                          })}

                          <td className="p-3.5 text-center border-l border-blue-100 bg-blue-50/20">
                            <span className="inline-block bg-blue-100 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-md text-xs font-bold font-mono">
                              {item.totalTerpakaiSemua} Hari
                            </span>
                          </td>

                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => setSelectedPegawaiDetail(p)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-all cursor-pointer font-bold text-[10px] flex items-center gap-1 mx-auto"
                              title="Lihat Rincian Lengkap Kuota Pegawai"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Rincian</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={pageSemua}
              totalPages={totalPagesSemua}
              onPageChange={setPageSemua}
              totalItems={semuaJenisData.length}
              itemsPerPage={itemsPerPageSemua}
            />
          </div>
        </div>
      )}

      {/* TAB 2: AKUMULASI CUTI TAHUNAN (N, N-1, N-2) */}
      {activeTab === 'akumulasi_tahunan' && (
        <div className="space-y-4">
          {/* Info Card BKN */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 text-xs text-blue-800">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="font-bold text-blue-950">Aturan Akumulasi Cuti Tahunan (Peraturan BKN No. 24 Tahun 2017):</p>
              <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                <li><strong>Cuti N (Tahun Berjalan {selectedYear}):</strong> Hak normal 12 hari kerja.</li>
                <li><strong>Cuti N-1 ({selectedYear - 1}):</strong> Apabila sisa N-1 &ge; 6 hari, maka dapat diakumulasikan <strong>maksimal 6 hari</strong> ditambah N. Apabila sisa N-1 &lt; 6 hari (misal [x]), maka diakumulasikan sebesar <strong>[x] + N</strong>.</li>
                <li><strong>Cuti N-2 ({selectedYear - 2}):</strong> Berapapun nilainya apabila sisa N-2 <strong>kurang dari 12 hari (&lt; 12)</strong>, maka <strong>HANGUS</strong> dan tidak bisa diakumulasikan ke total kuota. Sisa N-2 hanya diakumulasikan (6 hari) jika N-2 dan N-1 utuh 12 hari (tidak pernah cuti 2 tahun berturut-turut, total maksimal 24 hari).</li>
              </ul>
            </div>
          </div>

          {/* Tabel Tahunan */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                    <th className="p-4 w-12">No</th>
                    <th className="p-4">NIP & Nama Pegawai</th>
                    <th className="p-4 text-center bg-gray-50/80">Sisa N-2 ({selectedYear - 2})</th>
                    <th className="p-4 text-center bg-gray-50/80">Sisa N-1 ({selectedYear - 1})</th>
                    <th className="p-4 text-center bg-blue-50/20">Sisa N ({selectedYear})</th>
                    <th className="p-4 text-center bg-blue-100/60 font-bold text-blue-950">Total Kuota Tersedia</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredSisaBase.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        Data saldo cuti tahunan tidak ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredSisaTahunan.map((sc, idx) => {
                      const p = getPegawaiDetail(sc.pegawaiId);
                      if (!p) return null;
                      
                      const total = hitungTotalCutiTahunan(sc);
                      const isN2Hangus = (sc.sisaN2 < 12 || sc.sisaN1 < 12) && sc.sisaN2 > 0;

                      const jcBesar = jenisCuti.find(j => j.nama.toLowerCase().includes('besar'));
                      const tookCB = jcBesar ? pengajuan.some(pj => 
                        pj.pegawaiId === sc.pegawaiId && 
                        pj.jenisCutiId === jcBesar.id && 
                        pj.status === 'Disetujui' &&
                        (pj.tanggalMulai ? new Date(pj.tanggalMulai).getFullYear() : selectedYear) === selectedYear
                      ) : false;

                      return (
                        <tr key={sc.id} className="hover:bg-gray-50/50 transition-all">
                          <td className="p-4 font-mono text-gray-400">{(pageTahunan - 1) * itemsPerPageTahunan + idx + 1}</td>
                          <td className="p-4">
                            <div className="font-bold text-gray-950">{p.nama}</div>
                            <div className="text-[10px] text-gray-400 font-mono">NIP. {p.nip} • {p.statusPegawai}</div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold font-mono shadow-sm border ${
                                isN2Hangus ? 'bg-rose-50/60 text-rose-600 border-rose-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                {sc.sisaN2} <span className="text-[10px] font-medium">Hari</span>
                              </span>
                              {isN2Hangus && (
                                <span className="text-[9px] text-rose-600 font-semibold mt-0.5">
                                  Hangus (&lt;12)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-bold font-mono shadow-sm">
                                {sc.sisaN1} <span className="text-[10px] font-medium text-amber-500">Hari</span>
                              </span>
                              <span className="text-[9px] text-amber-800/80 font-medium mt-0.5">
                                {sc.sisaN1 >= 6 ? 'Diakui 6 hr' : `Diakui ${sc.sisaN1} hr`}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-bold font-mono shadow-sm">
                              {sc.sisaN} <span className="text-[10px] font-medium text-emerald-500">Hari</span>
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {tookCB ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="inline-block bg-rose-600 text-white border border-rose-700 px-3 py-1 rounded-lg text-xs font-black font-mono shadow-sm">
                                  0 Hari
                                </span>
                                <span className="text-[9px] text-rose-700 font-bold mt-0.5">
                                  Gugur (Cuti Besar)
                                </span>
                              </div>
                            ) : (
                              <span className="inline-block bg-blue-600 text-white border border-blue-700 px-3 py-1 rounded-lg text-sm font-black font-mono shadow-sm">
                                {total} <span className="text-[10px] font-semibold text-blue-200">Hari</span>
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center">
                              {isAdmin && (
                                <>
                                  <button
                                    id={`btn-edit-sisa-${sc.id}`}
                                    onClick={() => openEditModal(sc)}
                                    className="p-1.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 rounded transition-all cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                                    title="Sesuaikan Saldo"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Sesuaikan</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setItemToDelete(sc.id);
                                      setShowDeleteConfirm(true);
                                    }}
                                    className="p-1.5 bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 border border-gray-200 rounded transition-all cursor-pointer ml-1"
                                    title="Hapus Saldo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
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
              currentPage={pageTahunan}
              totalPages={totalPagesTahunan}
              onPageChange={setPageTahunan}
              totalItems={filteredSisaBase.length}
              itemsPerPage={itemsPerPageTahunan}
            />
          </div>
        </div>
      )}

      {/* TAB 3: SISTEM PENGURANGAN KUOTA & REGULASI BKN */}
      {activeTab === 'sistem_pengurangan' && (
        <div className="space-y-6">
          {/* Banner Regulasi */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-blue-400/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Kepatuhan Regulasi Manajemen ASN</span>
                </div>
                <h4 className="text-base font-extrabold text-white tracking-wide">
                  Sistem &amp; Tata Cara Pengurangan Kuota Cuti ASN
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Identifikasi kesesuaian sistem pengurangan saldo kuota cuti berdasarkan <strong>Peraturan BKN No. 24 Tahun 2017 jo Peraturan BKN No. 7 Tahun 2021</strong>, <strong>PP No. 11 Tahun 2017 jo PP No. 17 Tahun 2020</strong> (Manajemen PNS), dan <strong>PP No. 49 Tahun 2018</strong> (Manajemen PPPK).
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
                  <div className="text-[10px] text-blue-200 uppercase font-mono">Total Kategori Cuti</div>
                  <div className="text-xl font-black text-white">{REGULASI_PENGURANGAN_CUTI_BKN.length} Jenis</div>
                </div>
              </div>
            </div>
          </div>

          {/* Matriks Perbandingan Sistem Pengurangan Kuota */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                <h5 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
                  Matriks Perbandingan Sistem Pengurangan Kuota Antar-Jenis Cuti
                </h5>
              </div>
              <span className="text-[11px] text-gray-500 font-mono">
                Menampilkan {filteredRegulasi.length} dari {REGULASI_PENGURANGAN_CUTI_BKN.length} jenis cuti
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3.5 w-12 text-center">No</th>
                    <th className="p-3.5 min-w-[160px]">Jenis Cuti &amp; Kode</th>
                    <th className="p-3.5 min-w-[130px]">Kuota Standar</th>
                    <th className="p-3.5 min-w-[100px] text-center">Satuan Hari</th>
                    <th className="p-3.5 min-w-[180px]">Pengaruh ke Cuti Tahunan</th>
                    <th className="p-3.5 min-w-[240px]">Urutan &amp; Sistem Pemotongan</th>
                    <th className="p-3.5 min-w-[150px]">Sifat Akumulasi</th>
                    <th className="p-3.5 min-w-[120px]">Hak Pegawai</th>
                    <th className="p-3.5 w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredRegulasi.map((reg, idx) => (
                    <tr key={reg.id} className="hover:bg-slate-50/70 transition-all">
                      <td className="p-3.5 text-center font-mono text-gray-400">{idx + 1}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-gray-900">{reg.namaJenis}</div>
                        <div className="text-[10px] text-blue-600 font-mono font-bold">Kode: {reg.singkatan}</div>
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-slate-800">{reg.kuotaStandar}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          reg.satuanHari === 'Hari Kerja'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-purple-50 text-purple-800 border border-purple-200'
                        }`}>
                          {reg.satuanHari}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold inline-block border ${
                          reg.pengaruhCutiTahunan === 'Mengurangi Cuti Tahunan'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : reg.pengaruhCutiTahunan === 'Menghilangkan Hak Cuti Tahunan'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {reg.pengaruhCutiTahunan}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 text-[11px] leading-relaxed">
                        <div className="font-bold text-slate-800 text-[10px] uppercase font-mono text-blue-700 mb-0.5">
                          {reg.urutanPemotongan}
                        </div>
                        <p className="line-clamp-2 text-slate-500">{reg.sistemPengurangan}</p>
                      </td>
                      <td className="p-3.5">
                        <span className="text-[11px] font-mono text-slate-700">
                          {reg.sifatAkumulasi}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {reg.hakPegawai}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setSelectedRegulasiModal(reg)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[10px] transition-all cursor-pointer flex items-center gap-1 mx-auto"
                          title="Lihat Detail Pasal & Poin Regulasi"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Rincian</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kartu Rincian Regulasi Masing-Masing Jenis Cuti */}
          <div className="space-y-4">
            <h5 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Panduan Lengkap Sistem Pengurangan &amp; Ketentuan Regulasi Resmi</span>
            </h5>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRegulasi.map(reg => (
                <div key={reg.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4 hover:border-blue-300 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {reg.singkatan}
                        </span>
                        <h4 className="text-sm font-extrabold text-gray-900">{reg.namaJenis}</h4>
                      </div>
                      <p className="text-[11px] text-gray-500 font-mono mt-1">
                        Kuota Standar: <strong className="text-gray-800">{reg.kuotaStandar}</strong> • Satuan: <strong>{reg.satuanHari}</strong>
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border shrink-0 ${
                      reg.pengaruhCutiTahunan === 'Mengurangi Cuti Tahunan'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : reg.pengaruhCutiTahunan === 'Menghilangkan Hak Cuti Tahunan'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {reg.pengaruhCutiTahunan}
                    </span>
                  </div>

                  {/* Sistem Pengurangan */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                      <Scale className="w-3.5 h-3.5 text-blue-600" />
                      <span>Sistem Pengurangan Kuota:</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{reg.sistemPengurangan}</p>
                    <div className="pt-1 text-[10px] font-mono text-blue-700">
                      <strong>Alur:</strong> {reg.urutanPemotongan}
                    </div>
                  </div>

                  {/* Poin Penting Regulasi BKN */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-gray-700 text-[11px] uppercase tracking-wider font-mono">
                      Ketentuan &amp; Poin Kritis Regulasi:
                    </div>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {reg.poinPenting.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2 leading-relaxed text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer Card: Dasar Hukum & Aksi */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                    <div className="truncate max-w-[260px]" title={reg.dasarHukum}>
                      <strong>Dasar:</strong> {reg.dasarHukum}
                    </div>
                    <button
                      onClick={() => setSelectedRegulasiModal(reg)}
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Buka Regulasi Lengkap</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: RINCIAN KUOTA SEMUA JENIS CUTI PEGAWAI */}
      {selectedPegawaiDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-base border border-white/20">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{selectedPegawaiDetail.nama}</h4>
                  <p className="text-[11px] text-blue-100 font-mono">
                    NIP. {selectedPegawaiDetail.nip} • {selectedPegawaiDetail.jabatan} ({selectedPegawaiDetail.statusPegawai})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPegawaiDetail(null)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Rincian Sisa Kuota Cuti (Tahun {selectedYear})
                </h5>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-mono">
                  Unit Kerja: {selectedPegawaiDetail.unitKerja}
                </span>
              </div>

              {/* Grid of leave quota cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {jenisCuti.map(jc => {
                  const detail = getSisaKuota(selectedPegawaiDetail.id, jc.id, selectedYear);
                  const isTahunan = jc.nama.toLowerCase().includes('tahunan') || jc.id === 'jc-1';
                  const percentage = detail.kuotaAwal > 0 ? Math.min(100, Math.round((detail.terpakai / detail.kuotaAwal) * 100)) : 0;

                  return (
                    <div key={jc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-slate-900">{jc.nama}</div>
                          <div className="text-[10px] text-slate-500">{jc.keterangan || `Kuota maksimal ${jc.kuotaDefault} hari`}</div>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          detail.sisa > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          Sisa: {detail.sisa} {detail.satuan.includes('Kalender') ? 'HK' : 'Hari'}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
                          <span>Terpakai: <strong>{detail.terpakai}</strong> {detail.satuan.includes('Kalender') ? 'HK' : 'Hari'}</span>
                          <span>Kuota: <strong>{detail.kuotaAwal}</strong> {detail.satuan.includes('Kalender') ? 'HK' : 'Hari'}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              percentage > 80 ? 'bg-rose-500' : percentage > 40 ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {detail.keterangan && (
                        <div className="text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 font-mono leading-relaxed">
                          <strong>Keterangan:</strong> {detail.keterangan}
                        </div>
                      )}

                      {/* Aturan Pengurangan Kuota Badge & Link */}
                      {(() => {
                        const aturan = getAturanCuti(jc.nama);
                        if (!aturan) return null;
                        return (
                          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                            <span className={`px-2 py-0.5 rounded font-bold border ${
                              aturan.pengaruhCutiTahunan === 'Mengurangi Cuti Tahunan'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : aturan.pengaruhCutiTahunan === 'Menghilangkan Hak Cuti Tahunan'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {aturan.pengaruhCutiTahunan}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedRegulasiModal(aturan)}
                              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                              title="Lihat Aturan BKN"
                            >
                              <Scale className="w-3 h-3" />
                              <span>Aturan BKN</span>
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>

              {/* Riwayat Pengajuan Cuti Pegawai Ini di Tahun Berjalan */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h5 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-600" />
                  Riwayat Cuti Disetujui Pada Tahun {selectedYear}
                </h5>

                {(() => {
                  const riwayat = pengajuan.filter(pj => {
                    if (pj.pegawaiId !== selectedPegawaiDetail.id || pj.status !== 'Disetujui') return false;
                    const yr = pj.tanggalMulai ? new Date(pj.tanggalMulai).getFullYear() : selectedYear;
                    return yr === selectedYear;
                  });

                  if (riwayat.length === 0) {
                    return (
                      <p className="text-xs text-gray-400 bg-slate-50 p-4 rounded-xl text-center border border-dashed border-gray-200">
                        Belum ada riwayat pengajuan cuti yang disetujui untuk pegawai ini pada tahun {selectedYear}.
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {riwayat.map(pj => {
                        const jc = jenisCuti.find(j => j.id === pj.jenisCutiId);
                        return (
                          <div key={pj.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-slate-900">{jc?.nama || 'Cuti'} ({pj.jumlahHari} Hari)</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                Periode: {pj.tanggalMulai} s.d. {pj.tanggalSelesai} • Surat: {pj.nomorSurat || '-'}
                              </div>
                              <div className="text-[11px] text-slate-600 italic mt-0.5">
                                &ldquo;{pj.alasan}&rdquo;
                              </div>
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Disetujui
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedPegawaiDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT SISA CUTI TAHUNAN */}
      {showModal && selectedSisa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h4 className="font-bold text-sm text-gray-800">Sesuaikan Saldo Cuti Tahunan</h4>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="text-xs font-bold text-gray-900">{getPegawaiDetail(selectedSisa.pegawaiId)?.nama}</div>
              <div className="text-[10px] text-gray-500 font-mono">NIP. {getPegawaiDetail(selectedSisa.pegawaiId)?.nip}</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Sisa Cuti N-2 ({selectedYear - 2})</label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  required
                  value={sisaN2}
                  onChange={(e) => setSisaN2(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[9px] text-gray-400">Maksimal akumulasi yang dapat diambil adalah 6 hari.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Sisa Cuti N-1 ({selectedYear - 1})</label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  required
                  value={sisaN1}
                  onChange={(e) => setSisaN1(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[9px] text-gray-400">Maksimal akumulasi yang dapat diambil adalah 6 hari.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Cuti Berjalan N ({selectedYear})</label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  required
                  value={sisaN}
                  onChange={(e) => setSisaN(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[9px] text-gray-400">Hak dasar cuti tahunan berjalan (Maksimal 12 hari).</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH SALDO CUTI TAHUNAN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h4 className="font-bold text-sm text-gray-800">Tambah Saldo Cuti Pegawai</h4>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Pilih Pegawai *</label>
                <select
                  required
                  value={addPegawaiId}
                  onChange={(e) => setAddPegawaiId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">-- Pilih Pegawai --</option>
                  {pegawai.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nama} (NIP. {p.nip})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">N-2 ({selectedYear - 2})</label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    required
                    value={sisaN2}
                    onChange={(e) => setSisaN2(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">N-1 ({selectedYear - 1})</label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    required
                    value={sisaN1}
                    onChange={(e) => setSisaN1(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">N ({selectedYear})</label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    required
                    value={sisaN}
                    onChange={(e) => setSisaN(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Tambahkan Saldo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="p-3 bg-rose-50 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Hapus Saldo Cuti</h4>
                <p className="text-xs text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus data saldo cuti tahunan ini dari database?
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  if (itemToDelete) {
                    await deleteSisaCuti(itemToDelete);
                    showToast('Saldo cuti berhasil dihapus.', 'success');
                    setShowDeleteConfirm(false);
                    setItemToDelete(null);
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL REGULASI & SISTEM PENGURANGAN KUOTA BKN */}
      {selectedRegulasiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-base border border-white/20">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
                      {selectedRegulasiModal.singkatan}
                    </span>
                    <h4 className="font-bold text-sm tracking-wide">{selectedRegulasiModal.namaJenis}</h4>
                  </div>
                  <p className="text-[11px] text-blue-100">
                    Sistem Pengurangan Kuota &amp; Kepatuhan Regulasi BKN
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRegulasiModal(null)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-gray-700 custom-scrollbar">
              {/* Badges overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  <div className="text-[9px] font-bold text-gray-400 uppercase font-mono">Batas Kuota</div>
                  <div className="text-xs font-black text-slate-800 mt-0.5">{selectedRegulasiModal.kuotaStandar}</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  <div className="text-[9px] font-bold text-gray-400 uppercase font-mono">Satuan Hari</div>
                  <div className="text-xs font-black text-blue-700 mt-0.5">{selectedRegulasiModal.satuanHari}</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  <div className="text-[9px] font-bold text-gray-400 uppercase font-mono">Pengaruh Cuti</div>
                  <div className="text-[11px] font-black text-indigo-700 mt-0.5 truncate" title={selectedRegulasiModal.pengaruhCutiTahunan}>
                    {selectedRegulasiModal.pengaruhCutiTahunan}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  <div className="text-[9px] font-bold text-gray-400 uppercase font-mono">Hak Pegawai</div>
                  <div className="text-[11px] font-black text-slate-800 mt-0.5">{selectedRegulasiModal.hakPegawai}</div>
                </div>
              </div>

              {/* Sistem Pengurangan Saldo */}
              <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl space-y-2">
                <h5 className="font-bold text-xs text-blue-950 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                  <Scale className="w-4 h-4 text-blue-600" />
                  <span>Mekanisme Pengurangan Saldo di Sistem</span>
                </h5>
                <p className="text-blue-900 leading-relaxed text-xs">
                  {selectedRegulasiModal.sistemPengurangan}
                </p>
                <div className="pt-1 text-[11px] text-blue-800 font-mono">
                  <strong>Urutan Pemotongan:</strong> {selectedRegulasiModal.urutanPemotongan}
                </div>
              </div>

              {/* Poin Kritis Regulasi BKN */}
              <div className="space-y-2">
                <h5 className="font-bold text-xs text-gray-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Ketentuan Kepatuhan Regulasi Resmi (BKN &amp; PP)</span>
                </h5>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
                  {selectedRegulasiModal.poinPenting.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Syarat Masa Kerja & Dasar Hukum */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-gray-500 uppercase font-mono">Syarat Masa Kerja</div>
                  <div className="text-xs font-semibold text-gray-800">{selectedRegulasiModal.syaratMasaKerja}</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-gray-500 uppercase font-mono">Sifat Akumulasi Saldo</div>
                  <div className="text-xs font-semibold text-gray-800">{selectedRegulasiModal.sifatAkumulasi}</div>
                </div>
              </div>

              <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-mono">
                <strong className="text-slate-800">Dasar Hukum:</strong> {selectedRegulasiModal.dasarHukum}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 italic">
                Sistem SIP-CUTI Setda Demak terintegrasi kepatuhan BKN.
              </span>
              <button
                type="button"
                onClick={() => setSelectedRegulasiModal(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  Filter
} from 'lucide-react';
import { SisaCutiTahunan, Pegawai, PengaturanUser, JenisCuti, PengajuanCuti, SisaKuotaDetail } from '../lib/types';
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
  
  // Tab State: 'semua_jenis' | 'akumulasi_tahunan'
  const [activeTab, setActiveTab] = useState<'semua_jenis' | 'akumulasi_tahunan'>('semua_jenis');

  // Global filters
  const currentYearNow = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYearNow);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnitKerja, setFilterUnitKerja] = useState('Semua');
  const [filterStatusPegawai, setFilterStatusPegawai] = useState('Semua');

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
    const isHariKerja = jc.nama.toLowerCase().includes('tahunan') || jc.nama.toLowerCase().includes('alasan penting') || jc.nama.toLowerCase().includes('penting');
    const satuan = (!isHariKerja) ? ('Hari Kalender' as const) : ('Hari Kerja' as const);

    const disetujui = pengajuan.filter(pj => {
      if (pj.pegawaiId !== pegawaiId || pj.jenisCutiId !== jcId || pj.status !== 'Disetujui') return false;
      const pjYear = pj.tanggalMulai ? new Date(pj.tanggalMulai).getFullYear() : tahun;
      return pjYear === tahun;
    });
    const terpakai = disetujui.reduce((acc, curr) => acc + (curr.jumlahHari || 0), 0);

    if (isTahunan) {
      const sc = sisaCuti.find(s => s.pegawaiId === pegawaiId);
      const totalSisa = hitungTotalCutiTahunan(sc);
      return {
        jenisCutiId: jc.id,
        namaJenis: jc.nama,
        kuotaAwal: totalSisa + terpakai,
        terpakai,
        sisa: totalSisa,
        satuan,
        keterangan: sc ? `N-2: ${sc.sisaN2}, N-1: ${sc.sisaN1}, N: ${sc.sisaN}` : 'Default 12 hari'
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
      </div>

      {/* Filter & Year Toolbar */}
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
                  Sisa kuota masing-masing jenis cuti dihitung otomatis dari <strong>Kuota Standar Per Tahun</strong> dikurangi total <strong>Hari Cuti yang Telah Disetujui</strong> pada tahun tersebut. Khusus Cuti Tahunan memperhitungkan akumulasi sisa N, N-1, dan N-2.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 bg-white/80 border border-blue-200/60 px-3.5 py-2 rounded-lg">
              <div className="text-center">
                <div className="text-[10px] text-gray-500 font-bold uppercase">Total Pegawai</div>
                <div className="text-base font-black text-gray-900">{stats.totalPeg}</div>
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="text-center">
                <div className="text-[10px] text-gray-500 font-bold uppercase">Cuti Disetujui ({selectedYear})</div>
                <div className="text-base font-black text-blue-700">{stats.totalCutiDisetujuiTahunIni} Hari</div>
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
                    {jenisCuti.map(jc => (
                      <th key={jc.id} className="p-3.5 text-center min-w-[130px] border-l border-slate-200/60">
                        <div className="font-bold text-slate-800 line-clamp-1" title={jc.nama}>{jc.nama}</div>
                        <div className="text-[10px] font-normal text-slate-500">
                          Kuota: {jc.kuotaDefault} {jc.nama.toLowerCase().includes('sakit') || jc.nama.toLowerCase().includes('melahirkan') || jc.nama.toLowerCase().includes('besar') || jc.nama.toLowerCase().includes('luar tanggungan') ? 'HK' : 'Hari'}
                        </div>
                      </th>
                    ))}
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
                            
                            const isExhausted = detail.sisa === 0 && detail.kuotaAwal > 0;
                            const isZeroQuota = detail.kuotaAwal === 0;

                            return (
                              <td key={jc.id} className="p-3 text-center border-l border-slate-100">
                                <div className="inline-flex flex-col items-center">
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
                                  {detail.terpakai > 0 && (
                                    <span className="text-[9px] text-amber-700 font-medium mt-0.5">
                                      Terpakai: {detail.terpakai}
                                    </span>
                                  )}
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
              <p className="font-bold text-blue-950">Aturan Akumulasi Cuti Tahunan (Peraturan BKN No. 5 Tahun 2017):</p>
              <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                <li><strong>Cuti N (Tahun Berjalan {selectedYear}):</strong> Hak dasar 12 hari kerja per tahun.</li>
                <li><strong>Cuti N-1 (Satu Tahun Sebelum):</strong> Maksimal akumulasi sisa kuota yang dapat dibawa adalah sisa cuti N-1 dengan ketentuan penambahan maksimal 6 hari kerja.</li>
                <li><strong>Cuti N-2 (Dua Tahun Sebelum):</strong> Maksimal akumulasi yang masih valid dari dua tahun lalu adalah maksimal 6 hari kerja. Jika pada tahun berjalan tidak digunakan, sisa kuota N-2 akan hangus di akhir tahun.</li>
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

                      return (
                        <tr key={sc.id} className="hover:bg-gray-50/50 transition-all">
                          <td className="p-4 font-mono text-gray-400">{(pageTahunan - 1) * itemsPerPageTahunan + idx + 1}</td>
                          <td className="p-4">
                            <div className="font-bold text-gray-950">{p.nama}</div>
                            <div className="text-[10px] text-gray-400 font-mono">NIP. {p.nip} • {p.statusPegawai}</div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-block bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-md text-xs font-bold font-mono shadow-sm">
                              {sc.sisaN2} <span className="text-[10px] font-medium text-rose-500">Hari</span>
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-bold font-mono shadow-sm">
                              {sc.sisaN1} <span className="text-[10px] font-medium text-amber-500">Hari</span>
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-bold font-mono shadow-sm">
                              {sc.sisaN} <span className="text-[10px] font-medium text-emerald-500">Hari</span>
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-block bg-blue-600 text-white border border-blue-700 px-3 py-1 rounded-lg text-sm font-black font-mono shadow-sm">
                              {total} <span className="text-[10px] font-semibold text-blue-200">Hari</span>
                            </span>
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

                      {isTahunan && detail.keterangan && (
                        <div className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200 font-mono">
                          Komponen: {detail.keterangan}
                        </div>
                      )}
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
    </div>
  );
}

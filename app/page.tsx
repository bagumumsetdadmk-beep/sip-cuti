'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DashboardView from '../components/DashboardView';
import PegawaiView from '../components/PegawaiView';
import HariLiburView from '../components/HariLiburView';
import AtasanPejabatView from '../components/AtasanPejabatView';
import JenisCutiView from '../components/JenisCutiView';
import SisaCutiView from '../components/SisaCutiView';
import RekapCutiView from '../components/RekapCutiView';
import PengajuanCutiView from '../components/PengajuanCutiView';
import CetakCutiView from '../components/CetakCutiView';
import PengaturanView from '../components/PengaturanView';
import UserView from '../components/UserView';

import LoginView from '../components/LoginView';

export default function Home() {
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const {
    pegawai,
    hariLibur,
    atasanPejabat,
    jenisCuti,
    sisaCuti,
    pengajuan,
    instansi,
    users,
    currentUser,
    loaded,
    addPegawai,
    updatePegawai,
    deletePegawai,
    addHariLibur,
    updateHariLibur,
    deleteHariLibur,
    addAtasanPejabat,
    updateAtasanPejabat,
    deleteAtasanPejabat,
    addJenisCuti,
    updateJenisCuti,
    deleteJenisCuti,
    addSisaCuti,
    updateSisaCuti,
    deleteSisaCuti,
    generateSisaCutiNextYear,
    addPengajuan,
    updatePengajuan,
    updatePengajuanStatus,
    deletePengajuan,
    updateInstansi,
    addUser,
    updateUser,
    deleteUser,
    switchUser,
    hitungHariKerja,
    hitungTanggalSelesai,
    hitungTotalCutiTahunan,
    dapatkanRekapCuti
  } = useAppData();

  if (!loaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin mb-4" />
        <h2 className="text-sm font-bold font-mono tracking-wider text-blue-400">MEMUAT SISTEM SIP-CUTI...</h2>
        <p className="text-[10px] text-slate-500 font-mono mt-1">Sekretariat Daerah Kabupaten Demak</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView users={users} onLogin={(u) => switchUser(u.id)} instansi={instansi} />;
  }

  // Render Component sesuai Menu Aktif
  const renderContent = () => {
    switch (currentMenu) {
      case 'dashboard':
        return (
          <DashboardView 
            pegawai={pegawai}
            pengajuan={pengajuan}
            jenisCuti={jenisCuti}
            setCurrentMenu={setCurrentMenu}
            currentUser={currentUser}
          />
        );
      case 'pegawai':
        return (
          <PegawaiView 
            pegawai={pegawai}
            addPegawai={addPegawai}
            updatePegawai={updatePegawai}
            deletePegawai={deletePegawai}
            currentUser={currentUser}
          />
        );
      case 'harilibur':
        return (
          <HariLiburView 
            hariLibur={hariLibur}
            addHariLibur={addHariLibur}
            updateHariLibur={updateHariLibur}
            deleteHariLibur={deleteHariLibur}
            currentUser={currentUser}
          />
        );
      case 'atasanpejabat':
        return (
          <AtasanPejabatView 
            atasanPejabat={atasanPejabat}
            pegawai={pegawai}
            addAtasanPejabat={addAtasanPejabat}
            updateAtasanPejabat={updateAtasanPejabat}
            deleteAtasanPejabat={deleteAtasanPejabat}
          />
        );
      case 'jeniscuti':
        return (
          <JenisCutiView 
            jenisCuti={jenisCuti}
            addJenisCuti={addJenisCuti}
            updateJenisCuti={updateJenisCuti}
            deleteJenisCuti={deleteJenisCuti}
          />
        );
      case 'sisacuti':
        return (
          <SisaCutiView 
            sisaCuti={sisaCuti}
            pegawai={pegawai}
            addSisaCuti={addSisaCuti}
            updateSisaCuti={updateSisaCuti}
            deleteSisaCuti={deleteSisaCuti}
            generateSisaCutiNextYear={generateSisaCutiNextYear}
            hitungTotalCutiTahunan={hitungTotalCutiTahunan}
            currentUser={currentUser}
          />
        );
      case 'rekapcuti':
        return (
          <RekapCutiView 
            pegawai={pegawai}
            jenisCuti={jenisCuti}
            dapatkanRekapCuti={dapatkanRekapCuti}
            currentUser={currentUser}
          />
        );
      case 'pengajuan':
        return (
          <PengajuanCutiView 
            pengajuan={pengajuan}
            pegawai={pegawai}
            jenisCuti={jenisCuti}
            atasanPejabat={atasanPejabat}
            sisaCuti={sisaCuti}
            currentUser={currentUser}
            addPengajuan={addPengajuan}
            updatePengajuanStatus={updatePengajuanStatus}
            updatePengajuan={updatePengajuan}
            deletePengajuan={deletePengajuan}
            hitungHariKerja={hitungHariKerja}
            hitungTanggalSelesai={hitungTanggalSelesai}
            hitungTotalCutiTahunan={hitungTotalCutiTahunan}
            isApprovalPage={false}
          />
        );
      case 'persetujuan':
        return (
          <PengajuanCutiView 
            pengajuan={pengajuan}
            pegawai={pegawai}
            jenisCuti={jenisCuti}
            atasanPejabat={atasanPejabat}
            sisaCuti={sisaCuti}
            currentUser={currentUser}
            addPengajuan={addPengajuan}
            updatePengajuanStatus={updatePengajuanStatus}
            updatePengajuan={updatePengajuan}
            deletePengajuan={deletePengajuan}
            hitungHariKerja={hitungHariKerja}
            hitungTanggalSelesai={hitungTanggalSelesai}
            hitungTotalCutiTahunan={hitungTotalCutiTahunan}
            isApprovalPage={true}
          />
        );
      case 'cetak':
        return (
          <CetakCutiView 
            pengajuan={pengajuan}
            pegawai={pegawai}
            jenisCuti={jenisCuti}
            sisaCuti={sisaCuti}
            instansi={instansi}
            currentUser={currentUser}
          />
        );
      case 'pengaturan':
        return (
          <PengaturanView 
            instansi={instansi}
            updateInstansi={updateInstansi}
          />
        );
      case 'user':
        return (
          <UserView 
            users={users}
            pegawai={pegawai}
            addUser={addUser}
            updateUser={updateUser}
            deleteUser={deleteUser}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-gray-400">
            Halaman sedang dalam pengembangan.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900">
      
      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden no-print"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - disembunyikan saat dicetak */}
      <div className={`no-print h-screen shrink-0 fixed lg:sticky top-0 z-50 transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          currentMenu={currentMenu} 
          setCurrentMenu={(menu) => {
            setCurrentMenu(menu);
            setIsMobileMenuOpen(false); // Close on mobile after select
          }} 
          currentUser={currentUser}
        />
      </div>

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header - disembunyikan saat dicetak */}
        <div className="no-print">
          <Header 
            currentUser={currentUser}
            users={users}
            switchUser={switchUser}
            instansiNama={instansi.namaInstansi}
            onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
          />
        </div>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto p-6 focus:outline-none custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>

      </div>
    </div>
  );
}

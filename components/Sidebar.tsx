'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  UserCheck, 
  FileText, 
  History, 
  FileEdit, 
  Printer, 
  Settings, 
  UserCog, 
  LogOut 
} from 'lucide-react';
import { useAppData } from '../hooks/useAppData';

interface SidebarProps {
  currentMenu: string;
  setCurrentMenu: (menu: string) => void;
  currentUser: {
    nama: string;
    role: string;
    username: string;
  } | null;
}

export default function Sidebar({ currentMenu, setCurrentMenu, currentUser }: SidebarProps) {
  const { instansi, pengajuan } = useAppData();
  
  const pendingCount = React.useMemo(() => {
    return pengajuan.filter(p => p.status === 'Menunggu' || p.status === 'Dalam Perbaikan' || p.status === 'Sudah Diperbaiki').length;
  }, [pengajuan]);

  const role = currentUser?.role || 'Admin';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'UTAMA', roles: ['Admin', 'Verifikator', 'Operator'] },
    { id: 'pegawai', label: 'Data Pegawai', icon: Users, section: 'MASTER DATA', roles: ['Admin', 'Verifikator', 'Operator'] },
    { id: 'harilibur', label: 'Hari Libur', icon: CalendarDays, section: 'MASTER DATA', roles: ['Admin'] },
    { id: 'atasanpejabat', label: 'Atasan & Pejabat', icon: UserCheck, section: 'MASTER DATA', roles: ['Admin'] },
    { id: 'jeniscuti', label: 'Jenis Cuti', icon: FileText, section: 'MASTER DATA', roles: ['Admin'] },
    { id: 'sisacuti', label: 'Sisa Cuti Tahunan', icon: History, section: 'MASTER DATA', roles: ['Admin', 'Verifikator', 'Operator'] },
    { id: 'rekapcuti', label: 'Rekap Cuti Pegawai', icon: FileText, section: 'MASTER DATA', roles: ['Admin', 'Verifikator', 'Operator'] },
    { id: 'pengajuan', label: 'Pengajuan Cuti', icon: FileEdit, section: 'TRANSAKSI', badge: pendingCount, roles: ['Admin', 'Verifikator', 'Operator'] },
    { id: 'cetak', label: 'Cetak Pengajuan Cuti', icon: Printer, section: 'TRANSAKSI', roles: ['Admin', 'Operator'] },
    { id: 'pengaturan', label: 'Pengaturan Instansi', icon: Settings, section: 'SISTEM', roles: ['Admin'] },
    { id: 'user', label: 'Pengaturan User', icon: UserCog, section: 'SISTEM', roles: ['Admin'] },
  ];

  // Group items by section
  const sections = ['UTAMA', 'MASTER DATA', 'TRANSAKSI', 'SISTEM'];

  return (
    <aside className="w-68 bg-[#0f172a] text-slate-300 flex flex-col h-screen border-r border-slate-800 shrink-0">
      {/* Header Sidebar / Logo Pemkab Demak */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        {instansi?.logoUrl ? (
          <img src={instansi.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-md border border-blue-400">
            D
          </div>
        )}
        <div>
          <h1 className="font-bold text-sm text-white tracking-wider truncate">SIP-CUTI SETDA</h1>
          <p className="text-xs text-blue-400 font-medium font-mono truncate">{instansi?.namaInstansi || 'KABUPATEN DEMAK'}</p>
        </div>
      </div>

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {sections.map(section => {
          const items = menuItems.filter(item => item.section === section && item.roles.includes(role));
          if (items.length === 0) return null;

          return (
            <div key={section} className="space-y-1">
              <span className="block text-[10px] font-bold text-slate-500 px-3 py-1 tracking-widest uppercase font-mono">
                {section}
              </span>
              {items.map(item => {
                const Icon = item.icon;
                const isActive = currentMenu === item.id;
                return (
                  <button
                    key={item.id}
                    id={`menu-btn-${item.id}`}
                    onClick={() => setCurrentMenu(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all relative ${
                      isActive 
                        ? 'text-white bg-blue-600 font-bold shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute inset-0 bg-blue-600 rounded-lg -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`} />
                    <span className="truncate text-left flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="shrink-0 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white text-[9px] font-bold rounded-full border border-rose-400 shadow-sm px-1 leading-none">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer Sidebar */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-center">
        <p className="text-[11px] text-slate-300 font-sans font-bold leading-normal">
          SIP-Cuti Setda V2.0, <span className="font-semibold text-slate-400">© 2025 - 2026 SETDA Demak</span>
        </p>
      </div>
    </aside>
  );
}

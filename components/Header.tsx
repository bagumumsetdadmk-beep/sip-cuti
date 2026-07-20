'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronDown, User, ShieldCheck, Menu, LogOut } from 'lucide-react';
import { PengaturanUser } from '../lib/types';

interface HeaderProps {
  currentUser: PengaturanUser | null;
  users: PengaturanUser[];
  switchUser: (id: string | null) => void;
  instansiNama: string;
  onMobileMenuToggle?: () => void;
}

export default function Header({ currentUser, users, switchUser, instansiNama, onMobileMenuToggle }: HeaderProps) {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format WIB (Western Indonesia Time / GMT+7)
      const optionsTime: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta'
      };
      const optionsDate: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Jakarta'
      };
      
      setTimeStr(now.toLocaleTimeString('id-ID', optionsTime) + ' WIB');
      setDateStr(now.toLocaleDateString('id-ID', optionsDate));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm relative z-40">
      {/* Keterangan Instansi */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button 
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer mr-1"
            onClick={onMobileMenuToggle}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-blue-600 tracking-wide uppercase font-mono">
            SISTEM INFORMASI PENGAJUAN CUTI ASN
          </span>
          <h2 className="text-[13px] sm:text-sm font-semibold text-gray-700 truncate max-w-[200px] sm:max-w-md">
            {instansiNama}
          </h2>
        </div>
      </div>

      {/* Info Waktu dan Akun */}
      <div className="flex items-center gap-6">
        {/* Widget Waktu Indonesia Barat */}
        <div className="hidden md:flex items-center gap-4 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-800 font-mono text-[11px] font-semibold">{dateStr}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span className="text-blue-950 font-mono text-[11px] font-semibold">{timeStr}</span>
          </div>
        </div>

        {/* Pemilih Akun (Switch Role Cepat untuk Demonstrasi) */}
        <div className="relative">
          <button
            id="user-menu-btn"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 transition-all cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono">
              {currentUser?.role.charAt(0)}
            </div>
            <div className="text-left hidden sm:block max-w-40">
              <p className="font-bold truncate leading-tight">{currentUser?.nama.split(',')[0]}</p>
              <p className="text-[10px] text-gray-400 font-mono leading-none">{currentUser?.role}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
          </button>

          {showUserDropdown && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowUserDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                  <p className="text-xs font-bold text-gray-800">
                    {currentUser?.nama}
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">
                    Role: {currentUser?.role}
                  </p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      switchUser(null);
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded text-xs flex items-center gap-2 text-rose-600 hover:bg-rose-50 font-bold transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar / Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

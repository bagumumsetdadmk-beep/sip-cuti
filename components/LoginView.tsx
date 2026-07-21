import React, { useState } from 'react';
import Image from 'next/image';
import { LogIn, KeyRound, User, ArrowRight } from 'lucide-react';
import { PengaturanUser, PengaturanInstansi } from '../lib/types';
import { useToast } from '../lib/ToastContext';

interface LoginViewProps {
  users: PengaturanUser[];
  instansi: PengaturanInstansi;
  onLogin: (user: PengaturanUser) => void;
}

export default function LoginView({ users, instansi, onLogin }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { showToast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      showToast(`Selamat datang, ${user.nama}`, 'success');
      onLogin(user);
    } else {
      showToast('Username atau password salah', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 md:bg-white">
      {/* Left Column - Image/Branding */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-slate-900 relative flex-col justify-between p-12 overflow-hidden border-r border-slate-200 shadow-2xl z-10">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image 
            src="https://picsum.photos/seed/demak/1920/1080" 
            alt="Background" 
            fill 
            className="object-cover opacity-20 mix-blend-overlay"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/90 via-slate-900/80 to-slate-950/95" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-4">
             {instansi.logoUrl ? (
                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                  <img 
                    src={instansi.logoUrl} 
                    alt={`Logo ${instansi.namaInstansi}`} 
                    className="w-10 h-10 object-contain drop-shadow-lg" 
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg border border-blue-400/30">
                  <span className="text-2xl font-black text-white">D</span>
                </div>
              )}
             <div>
               <h2 className="text-white font-bold tracking-widest text-lg font-sans drop-shadow-sm">SIP-CUTI SETDA</h2>
               <p className="text-blue-300 text-xs font-mono tracking-wider">{instansi.namaInstansi}</p>
             </div>
          </div>
        </div>

        <div className="relative z-10 max-w-xl mt-auto mb-10">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold tracking-wider font-mono mb-6 backdrop-blur-sm">
            SISTEM MANAJEMEN CUTI ASN
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] tracking-tight mb-6 drop-shadow-md">
            Pengelolaan Cuti ASN <span className="text-blue-400">Sekretariat Daerah Kabupaten Demak</span>
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-10 max-w-md font-medium">
            Digitalisasi proses pengajuan, verifikasi, hingga pencetakan dokumen cuti pegawai Sekretariat Daerah Kabupaten Demak secara terpusat dan akurat berdasarkan Peraturan BKN.
          </p>
          
          <div className="flex items-center gap-6 text-[13px] font-sans text-slate-200 bg-black/30 px-5 py-3.5 rounded-xl border border-white/10 backdrop-blur-sm inline-flex shadow-md">
            <span className="flex items-center gap-2 font-bold text-green-400">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse"></span>
              Sistem Aktif
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span className="font-bold">Versi 2.0</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span className="font-bold text-slate-300">© 2025 - 2026 SETDA Demak</span>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full min-h-screen md:min-h-0 md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 relative bg-slate-50 md:bg-white">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex flex-col items-center mb-10 text-center w-full">
           <div className="w-20 h-20 mb-5 relative">
            {instansi.logoUrl ? (
                <img 
                  src={instansi.logoUrl} 
                  alt={`Logo ${instansi.namaInstansi}`} 
                  className="w-full h-full object-contain drop-shadow-xl" 
                />
              ) : (
                <div className="w-full h-full bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl rotate-3">
                  <span className="text-4xl font-black text-white">D</span>
                </div>
              )}
           </div>
           <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">SIP-CUTI SETDA</h1>
           <p className="text-sm text-slate-500 font-mono mt-1.5">{instansi.namaInstansi}</p>
        </div>

        <div className="w-full max-w-[360px] space-y-8 bg-white md:bg-transparent p-8 rounded-3xl md:p-0 shadow-sm border border-slate-100 md:border-none md:shadow-none">
          <div className="text-left hidden md:block">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Selamat Datang 👋</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Silakan masuk menggunakan akun Anda untuk mengakses dashboard manajemen cuti.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider font-mono">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 md:bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all shadow-sm font-medium"
                    placeholder="Masukkan username Anda"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider font-mono flex justify-between">
                  <span>Password</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 md:bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all shadow-sm font-medium"
                    placeholder="Masukkan password Anda"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="group w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="md:hidden pt-6 mt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600 font-sans font-bold leading-normal">
              SIP-Cuti Setda V2.0, <span className="font-semibold text-slate-500">© 2025 - 2026 SETDA Demak</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

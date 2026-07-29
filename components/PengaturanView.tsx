'use client';

import React, { useState } from 'react';
import { Settings, Save, Landmark, Phone, Mail, Globe, UserCheck, AlertCircle } from 'lucide-react';
import { PengaturanInstansi } from '../lib/types';
import { useToast } from '../lib/ToastContext';
import { supabase } from '../lib/supabase';
import { getStorageFilePath } from '../lib/utils';

interface PengaturanViewProps {
  instansi: PengaturanInstansi;
  updateInstansi: (data: PengaturanInstansi) => void;
}

export default function PengaturanView({ instansi, updateInstansi }: PengaturanViewProps) {
  const { showToast } = useToast();
  const [namaInstansi, setNamaInstansi] = useState(instansi.namaInstansi);
  const [alamat, setAlamat] = useState(instansi.alamat);
  const [telp, setTelp] = useState(instansi.telp);
  const [email, setEmail] = useState(instansi.email);
  const [website, setWebsite] = useState(instansi.website);
  const [namaKepala, setNamaKepala] = useState(instansi.namaKepala);
  const [nipKepala, setNipKepala] = useState(instansi.nipKepala);
  const [jabatanKepala, setJabatanKepala] = useState(instansi.jabatanKepala);
  const [logoUrl, setLogoUrl] = useState(instansi.logoUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateInstansi({
      namaInstansi,
      alamat,
      telp,
      email,
      website,
      namaKepala,
      nipKepala,
      jabatanKepala,
      logoUrl: logoUrl
    });
    showToast('Pengaturan instansi berhasil disimpan.', 'success');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-gray-800">Pengaturan Instansi Sekretariat Daerah</h3>
        <p className="text-xs text-gray-500">Sesuaikan profil data instansi, pimpinan kepala daerah, alamat, dan nomor kontak resmi Sekretariat Daerah Kabupaten Demak.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Pengaturan */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2 text-blue-700">
              <Landmark className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Profil Administrasi Instansi</h4>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Nama Instansi Daerah *</label>
              <input
                type="text"
                required
                value={namaInstansi}
                onChange={(e) => setNamaInstansi(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold text-gray-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Alamat Resmi Kantor Sekretariat *</label>
              <textarea
                required
                rows={2}
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-800"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span>No. Telpon Kantor *</span>
                </label>
                <input
                  type="text"
                  required
                  value={telp}
                  onChange={(e) => setTelp(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Mail className="w-3 h-3 text-gray-400" />
                  <span>Email Resmi *</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Globe className="w-3 h-3 text-gray-400" />
                  <span>Situs Web Instansi *</span>
                </label>
                <input
                  type="text"
                  required
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
              </div>
            </div>

            <div className="border-b border-gray-100 pt-4 pb-3 flex items-center gap-2 text-blue-700">
              <UserCheck className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Kepala Daerah / Pejabat Penandatangan Utama</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Nama Kepala / Sekretaris Daerah *</label>
                <input
                  type="text"
                  required
                  value={namaKepala}
                  onChange={(e) => setNamaKepala(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">NIP Kepala Daerah (18 Digit) *</label>
                <input
                  type="text"
                  required
                  maxLength={18}
                  value={nipKepala}
                  onChange={(e) => setNipKepala(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Nama Jabatan Kepala *</label>
                <input
                  type="text"
                  required
                  value={jabatanKepala}
                  onChange={(e) => setJabatanKepala(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Logo Instansi (Maks. 500kb)</label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 500 * 1024) {
                        showToast('Ukuran gambar maksimal 500 KB', 'error');
                        e.target.value = '';
                        return;
                      }
                      
                      setIsUploading(true);
                      const oldLogoUrl = logoUrl;
                      try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `logo_${Date.now()}.${fileExt}`;
                        
                        const { error } = await supabase.storage
                          .from('berkas_cuti')
                          .upload(fileName, file);
                          
                        if (error) throw error;
                        
                        const { data } = supabase.storage
                          .from('berkas_cuti')
                          .getPublicUrl(fileName);
                          
                        setLogoUrl(data.publicUrl);
                        showToast('Logo berhasil diunggah', 'success');

                        if (oldLogoUrl) {
                          const oldPath = getStorageFilePath(oldLogoUrl);
                          if (oldPath) {
                            try {
                              await supabase.storage.from('berkas_cuti').remove([oldPath]);
                            } catch (err) {
                              console.warn('Gagal menghapus logo lama:', err);
                            }
                          }
                        }
                      } catch (error: any) {
                        console.error('Error uploading logo:', error);
                        showToast('Gagal mengunggah logo: ' + error.message, 'error');
                        e.target.value = '';
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                {isSaved && (
                  <span className="text-xs text-blue-600 font-bold animate-pulse">
                    ✓ Pengaturan berhasil disimpan secara permanen.
                  </span>
                )}
              </div>
              <button
                type="submit"
                id="btn-simpan-pengaturan"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>

          </form>
        </div>

        {/* Info Card / Preview Branding */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow flex flex-col justify-between aspect-video relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-20px] text-slate-800/40 transform scale-[3.5] select-none pointer-events-none">
              <Landmark />
            </div>
            
            <div className="space-y-1 z-10 flex flex-col items-start gap-2">
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest font-mono">
                Logo Instansi
              </span>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo Instansi" className="w-12 h-12 object-contain" />
              ) : (
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Landmark className="w-6 h-6 text-slate-500" />
                </div>
              )}
              <h4 className="text-sm font-black mt-2 leading-tight">{namaInstansi}</h4>
              <p className="text-[10px] text-blue-300 font-mono">{alamat}</p>
            </div>

            <div className="mt-8 text-xs font-medium z-10 font-mono">
              <p className="text-[10px] text-slate-400 leading-none">PIMPINAN / SEKDA:</p>
              <p className="text-white font-bold leading-relaxed">{namaKepala}</p>
              <p className="text-[9px] text-slate-400 leading-none">NIP. {nipKepala}</p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900 leading-relaxed space-y-1.5">
            <p className="font-bold flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Instruksi Sinkronisasi Dokumen:</span>
            </p>
            <p className="text-[11px] leading-relaxed text-amber-950">
              Setiap perubahan pada formulir pengaturan pimpinan (Nama & NIP Sekda) di atas akan secara dinamis diwarisi oleh tajuk, badan lembar, kolom pertimbangan pimpinan, serta tanda tangan pada berkas Cetak Formulir Cuti BKN ASN secara real-time.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

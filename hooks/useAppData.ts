// hooks/useAppData.ts
'use client';

import { useState, useEffect } from 'react';
import { Pegawai, HariLibur, AtasanPejabat, JenisCuti, SisaCutiTahunan, PengajuanCuti, PengaturanInstansi, PengaturanUser } from '../lib/types';
import { supabase } from '../lib/supabase';
import { getStorageFilePath } from '../lib/utils';
import { initialUsers, defaultPengaturanInstansi, initialPegawai, initialHariLibur, initialAtasanPejabat, initialJenisCuti, initialSisaCutiTahunan, initialPengajuanCuti } from '../lib/initialData';

// Helper mapping functions
const mapPegawai = (p: any): Pegawai => {
  const localQr = typeof window !== 'undefined' ? localStorage.getItem(`pegawai_qr_${p.id}`) : undefined;
  return {
    id: p.id,
    nip: p.nip,
    nama: p.nama,
    jabatan: p.jabatan,
    golongan: p.golongan || '',
    unitKerja: p.unit_kerja,
    statusPegawai: p.status_pegawai,
    jenisKelamin: p.jenis_kelamin || 'Laki-laki',
    masaKerja: p.masa_kerja || '',
    noHp: p.no_hp || '',
    qrCodeUrl: p.qr_code_url || localQr || undefined
  };
};

const mapJenisCuti = (j: any): JenisCuti => ({
  id: j.id,
  nama: j.nama,
  kuotaDefault: j.kuota_default,
  keterangan: j.deskripsi || '',
  hakPegawai: j.hak_pegawai || 'Semua'
});

const mapHariLibur = (h: any): HariLibur => ({
  id: h.id,
  tanggal: h.tanggal,
  keterangan: h.keterangan,
  jenis: h.jenis || 'Libur Nasional'
});

const mapAtasan = (a: any): AtasanPejabat => ({
  id: a.id,
  pegawaiId: a.pegawai_id,
  peran: a.peran,
  statusActive: a.status_active
});

const mapSisaCuti = (s: any): SisaCutiTahunan => ({
  id: s.id,
  pegawaiId: s.pegawai_id,
  sisaN2: s.sisa_n2,
  sisaN1: s.sisa_n1,
  sisaN: s.sisa_n,
  tahunN: s.tahun_n || new Date().getFullYear()
});

const mapPengajuan = (p: any): PengajuanCuti => ({
  id: p.id,
  nomorSurat: p.nomor_surat || '',
  pegawaiId: p.pegawai_id,
  jenisCutiId: p.jenis_cuti_id,
  tanggalMulai: p.tanggal_mulai,
  tanggalSelesai: p.tanggal_selesai,
  jumlahHari: p.jumlah_hari,
  alasan: p.alasan || '',
  alamatSelamaCuti: p.alamat_selama_cuti || '',
  status: p.status,
  catatanPerbaikan: p.catatan_atasan || p.catatan_pejabat || '',
  berkasPendukung: p.berkas_pendukung_url || undefined,
  atasanId: p.atasan_id || '',
  pejabatId: p.pejabat_id || '',
  tanggalPengajuan: p.tanggal_pengajuan,
  noTelpHubungi: p.no_telp_hubungi || '',
  ttdDigitalPemohon: p.ttd_digital_pemohon !== undefined ? p.ttd_digital_pemohon : true,
  ttdDigitalAtasan: p.ttd_digital_atasan !== undefined ? p.ttd_digital_atasan : true,
  ttdDigitalPejabat: p.ttd_digital_pejabat !== undefined ? p.ttd_digital_pejabat : true,
  metodePenandatanganan: p.metode_penandatanganan || (
    (p.ttd_digital_pemohon !== false && p.ttd_digital_atasan === false && p.ttd_digital_pejabat === false)
      ? 'HYBRID'
      : ((p.ttd_digital_atasan !== false && p.ttd_digital_pejabat !== false) ? 'TTE' : 'MANUAL')
  )
});

export function useAppData() {
  const [pegawai, setPegawai] = useState<Pegawai[]>([]);
  const [hariLibur, setHariLibur] = useState<HariLibur[]>([]);
  const [atasanPejabat, setAtasanPejabat] = useState<AtasanPejabat[]>([]);
  const [jenisCuti, setJenisCuti] = useState<JenisCuti[]>([]);
  const [sisaCuti, setSisaCuti] = useState<SisaCutiTahunan[]>([]);
  const [pengajuan, setPengajuan] = useState<PengajuanCuti[]>([]);
  const [instansi, setInstansi] = useState<PengaturanInstansi>(defaultPengaturanInstansi);
  const [users, setUsers] = useState<PengaturanUser[]>([]);
  
  const [currentUser, setCurrentUser] = useState<PengaturanUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchAllData = async () => {
    try {
      const [
        { data: instansiData },
        { data: pegawaiData },
        { data: jcData },
        { data: apData },
        { data: scData },
        { data: pjData },
        { data: uData },
        { data: hlData }
      ] = await Promise.all([
        supabase.from('pengaturan_instansi').select('*').limit(1).maybeSingle(),
        supabase.from('pegawai').select('*'),
        supabase.from('jenis_cuti').select('*'),
        supabase.from('atasan_pejabat').select('*'),
        supabase.from('sisa_cuti_tahunan').select('*'),
        supabase.from('pengajuan_cuti').select('*').order('created_at', { ascending: false }),
        supabase.from('users_role').select('*'),
        supabase.from('hari_libur').select('*') 
      ]);

      if (instansiData) {
        setInstansi({
          namaInstansi: instansiData.nama_instansi,
          alamat: instansiData.alamat || '',
          telp: instansiData.telp || '',
          email: instansiData.email || '',
          website: instansiData.website || '',
          namaKepala: instansiData.jabatan_kepala || '',
          nipKepala: '',
          jabatanKepala: instansiData.jabatan_kepala || '',
          logoUrl: instansiData.logo_url || ''
        });
      }
      
      if (pegawaiData) setPegawai(pegawaiData.map(mapPegawai));
      if (jcData) setJenisCuti(jcData.map(mapJenisCuti));
      if (apData) setAtasanPejabat(apData.map(mapAtasan));
      if (scData) setSisaCuti(scData.map(mapSisaCuti));
      if (pjData) setPengajuan(pjData.map(mapPengajuan));
      
      if (uData && uData.length > 0) {
        setUsers(uData.map((u: any) => ({
          id: u.id,
          username: u.username,
          nama: u.nama || u.username, 
          role: u.role,
          password: u.password || '***',
          pegawaiId: u.pegawai_id
        })));
      } else {
        // Jika DB kosong, coba inject initialUsers agar bisa login
        try {
          const defaultUsers = initialUsers.map(u => ({
            username: u.username,
            nama: u.nama,
            password: u.password,
            role: u.role,
            pegawai_id: u.pegawaiId || null
          }));
          await supabase.from('users_role').insert(defaultUsers);
          
          const { data: refreshed } = await supabase.from('users_role').select('*');
          if (refreshed && refreshed.length > 0) {
            setUsers(refreshed.map((u: any) => ({
              id: u.id,
              username: u.username,
              nama: u.nama || u.username, 
              role: u.role,
              password: u.password || '***',
              pegawaiId: u.pegawai_id
            })));
          } else {
            setUsers(initialUsers);
          }
        } catch (e) {
          console.error("Gagal auto-seed users:", e);
          setUsers(initialUsers);
        }
      }
      
      if (hlData) {
         setHariLibur(hlData.map(mapHariLibur));
      } else {
         setHariLibur(initialHariLibur);
      }

    } catch (error) {
      console.error("Error loading data from Supabase:", error);
      // Fallback
      setPegawai(initialPegawai);
      setJenisCuti(initialJenisCuti);
      setHariLibur(initialHariLibur);
      setAtasanPejabat(initialAtasanPejabat);
      setSisaCuti(initialSisaCutiTahunan);
      setPengajuan(initialPengajuanCuti);
      setUsers(initialUsers);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllData();
    
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('sip_cuti_currentuser');
      if (savedUser) {
        try { setCurrentUser(JSON.parse(savedUser)); } catch (e) {}
      }
    }
  }, []);

  // Effect untuk memperbarui Favicon browser tab berdasarkan logo instansi
  useEffect(() => {
    if (typeof document !== 'undefined' && instansi?.logoUrl) {
      const targetUrl = instansi.logoUrl;
      const selectors = ["link[rel='icon']", "link[rel='shortcut icon']", "link[rel='apple-touch-icon']"];
      let updated = false;

      selectors.forEach(selector => {
        const link: HTMLLinkElement | null = document.querySelector(selector);
        if (link) {
          link.href = targetUrl;
          updated = true;
        }
      });

      if (!updated) {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = targetUrl;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    }
  }, [instansi?.logoUrl]);

  // == CRUD PEGAWAI ==
  const addPegawai = async (p: Omit<Pegawai, 'id'>) => {
    const payload: any = {
      nip: p.nip,
      nama: p.nama,
      jabatan: p.jabatan,
      unit_kerja: p.unitKerja,
      masa_kerja: p.masaKerja,
      status_pegawai: p.statusPegawai,
      golongan: p.golongan,
      jenis_kelamin: p.jenisKelamin,
      no_hp: p.noHp,
      qr_code_url: p.qrCodeUrl || null
    };
    const { data, error } = await supabase.from('pegawai').insert(payload).select().single();
    if (!error && data) {
      if (p.qrCodeUrl) {
        localStorage.setItem(`pegawai_qr_${data.id}`, p.qrCodeUrl);
      }
      setPegawai([mapPegawai(data), ...pegawai]);
    } else {
      console.error(error);
      // Fallback if column qr_code_url doesn't exist yet in Supabase
      const fallbackPayload = { ...payload };
      delete fallbackPayload.qr_code_url;
      const { data: fallbackData, error: fallbackError } = await supabase.from('pegawai').insert(fallbackPayload).select().single();
      if (!fallbackError && fallbackData) {
        if (p.qrCodeUrl) {
          localStorage.setItem(`pegawai_qr_${fallbackData.id}`, p.qrCodeUrl);
        }
        const mapped = mapPegawai(fallbackData);
        if (p.qrCodeUrl) mapped.qrCodeUrl = p.qrCodeUrl;
        setPegawai([mapped, ...pegawai]);
      } else {
        console.error(fallbackError);
      }
    }
  };

  const updatePegawai = async (id: string, p: Partial<Pegawai>) => {
    const payload: any = {};
    if (p.nip !== undefined) payload.nip = p.nip;
    if (p.nama !== undefined) payload.nama = p.nama;
    if (p.jabatan !== undefined) payload.jabatan = p.jabatan;
    if (p.unitKerja !== undefined) payload.unit_kerja = p.unitKerja;
    if (p.masaKerja !== undefined) payload.masa_kerja = p.masaKerja;
    if (p.statusPegawai !== undefined) payload.status_pegawai = p.statusPegawai;
    if (p.golongan !== undefined) payload.golongan = p.golongan;
    if (p.jenisKelamin !== undefined) payload.jenis_kelamin = p.jenisKelamin;
    if (p.noHp !== undefined) payload.no_hp = p.noHp;
    if (p.qrCodeUrl !== undefined) payload.qr_code_url = p.qrCodeUrl || null;

    const { data, error } = await supabase.from('pegawai').update(payload).eq('id', id).select().single();
    if (!error && data) {
      if (p.qrCodeUrl !== undefined) {
        if (p.qrCodeUrl) {
          localStorage.setItem(`pegawai_qr_${id}`, p.qrCodeUrl);
        } else {
          localStorage.removeItem(`pegawai_qr_${id}`);
        }
      }
      setPegawai(pegawai.map(item => item.id === id ? mapPegawai(data) : item));
    } else {
      console.error(error);
      // Fallback if column qr_code_url doesn't exist yet in Supabase
      const fallbackPayload = { ...payload };
      delete fallbackPayload.qr_code_url;
      const { data: fallbackData, error: fallbackError } = await supabase.from('pegawai').update(fallbackPayload).eq('id', id).select().single();
      if (!fallbackError && fallbackData) {
        if (p.qrCodeUrl !== undefined) {
          if (p.qrCodeUrl) {
            localStorage.setItem(`pegawai_qr_${id}`, p.qrCodeUrl);
          } else {
            localStorage.removeItem(`pegawai_qr_${id}`);
          }
        }
        const mapped = mapPegawai(fallbackData);
        if (p.qrCodeUrl) mapped.qrCodeUrl = p.qrCodeUrl;
        setPegawai(pegawai.map(item => item.id === id ? mapped : item));
      } else {
        console.error(fallbackError);
      }
    }
  };

  const deletePegawai = async (id: string) => {
    const { error } = await supabase.from('pegawai').delete().eq('id', id);
    if (!error) setPegawai(pegawai.filter(item => item.id !== id));
  };

  // == CRUD HARI LIBUR ==
  const addHariLibur = async (hl: Omit<HariLibur, 'id'>) => {
    const { data, error } = await supabase.from('hari_libur').insert(hl).select().single();
    if (!error && data) {
      setHariLibur([...hariLibur, mapHariLibur(data)]);
    }
  };

  const updateHariLibur = async (id: string, hl: Partial<HariLibur>) => {
    const { data, error } = await supabase.from('hari_libur').update(hl).eq('id', id).select().single();
    if (!error && data) {
      setHariLibur(hariLibur.map(item => item.id === id ? mapHariLibur(data) : item));
    }
  };

  const deleteHariLibur = async (id: string) => {
    const { error } = await supabase.from('hari_libur').delete().eq('id', id);
    if (!error) setHariLibur(hariLibur.filter(item => item.id !== id));
  };

  // == CRUD ATASAN PEJABAT ==
  const addAtasanPejabat = async (ap: Omit<AtasanPejabat, 'id'>) => {
    const payload = { pegawai_id: ap.pegawaiId, peran: ap.peran, status_active: ap.statusActive };
    const { data, error } = await supabase.from('atasan_pejabat').insert(payload).select().single();
    if (!error && data) setAtasanPejabat([...atasanPejabat, mapAtasan(data)]);
  };

  const updateAtasanPejabat = async (id: string, ap: Partial<AtasanPejabat>) => {
    const payload: any = {};
    if (ap.pegawaiId !== undefined) payload.pegawai_id = ap.pegawaiId;
    if (ap.peran !== undefined) payload.peran = ap.peran;
    if (ap.statusActive !== undefined) payload.status_active = ap.statusActive;
    
    const { data, error } = await supabase.from('atasan_pejabat').update(payload).eq('id', id).select().single();
    if (!error && data) setAtasanPejabat(atasanPejabat.map(item => item.id === id ? mapAtasan(data) : item));
  };

  const deleteAtasanPejabat = async (id: string) => {
    const { error } = await supabase.from('atasan_pejabat').delete().eq('id', id);
    if (!error) setAtasanPejabat(atasanPejabat.filter(item => item.id !== id));
  };

  // == CRUD JENIS CUTI ==
  const addJenisCuti = async (jc: Omit<JenisCuti, 'id'>) => {
    const payload = { nama: jc.nama, kuota_default: jc.kuotaDefault, deskripsi: jc.keterangan, hak_pegawai: jc.hakPegawai };
    const { data, error } = await supabase.from('jenis_cuti').insert(payload).select().single();
    if (!error && data) setJenisCuti([...jenisCuti, mapJenisCuti(data)]);
  };

  const updateJenisCuti = async (id: string, jc: Partial<JenisCuti>) => {
    const payload: any = {};
    if (jc.nama !== undefined) payload.nama = jc.nama;
    if (jc.kuotaDefault !== undefined) payload.kuota_default = jc.kuotaDefault;
    if (jc.keterangan !== undefined) payload.deskripsi = jc.keterangan;
    if (jc.hakPegawai !== undefined) payload.hak_pegawai = jc.hakPegawai;
    
    const { data, error } = await supabase.from('jenis_cuti').update(payload).eq('id', id).select().single();
    if (!error && data) setJenisCuti(jenisCuti.map(item => item.id === id ? mapJenisCuti(data) : item));
  };

  const deleteJenisCuti = async (id: string) => {
    const { error } = await supabase.from('jenis_cuti').delete().eq('id', id);
    if (!error) setJenisCuti(jenisCuti.filter(item => item.id !== id));
  };

  // == SISA CUTI TAHUNAN ==
  const deleteSisaCuti = async (id: string) => {
    const { error } = await supabase.from('sisa_cuti_tahunan').delete().eq('id', id);
    if (!error) setSisaCuti(sisaCuti.filter(item => item.id !== id));
  };

  const updateSisaCuti = async (id: string, sc: Partial<SisaCutiTahunan>) => {
    const payload: any = {};
    if (sc.sisaN2 !== undefined) payload.sisa_n2 = sc.sisaN2;
    if (sc.sisaN1 !== undefined) payload.sisa_n1 = sc.sisaN1;
    if (sc.sisaN !== undefined) payload.sisa_n = sc.sisaN;

    const { data, error } = await supabase.from('sisa_cuti_tahunan').update(payload).eq('id', id).select().single();
    if (!error && data) setSisaCuti(sisaCuti.map(item => item.id === id ? mapSisaCuti(data) : item));
  };

  const addSisaCuti = async (sc: Omit<SisaCutiTahunan, 'id'>) => {
    const payload = {
      pegawai_id: sc.pegawaiId,
      tahun_n: sc.tahunN,
      sisa_n2: sc.sisaN2,
      sisa_n1: sc.sisaN1,
      sisa_n: sc.sisaN
    };
    const { error } = await supabase.from('sisa_cuti_tahunan').insert([payload]);
    if (error) console.error('Error add sisa cuti:', error);
    else fetchAllData();
  };

  const generateSisaCutiNextYear = async () => {
    try {
      const currentYear = new Date().getFullYear();
      let hasError = false;
      let lastErrorMessage = '';
      
      for (const p of pegawai) {
        // Cek apakah pegawai ini sudah punya sisa cuti di tahun ini
        const existing = sisaCuti.find(s => s.pegawaiId === p.id && s.tahunN === currentYear);
        if (!existing) {
          const payload = {
            pegawai_id: p.id,
            sisa_n2: 0,
            sisa_n1: 0,
            sisa_n: 12,
            tahun_n: currentYear
          };
          const { error } = await supabase.from('sisa_cuti_tahunan').insert([payload]);
          if (error) {
            console.error('Error generate sisa cuti:', error);
            hasError = true;
            lastErrorMessage = error.message;
          }
        }
      }
      
      await fetchAllData();
      
      if (hasError) {
        throw new Error(lastErrorMessage || 'Terjadi kesalahan saat menyimpan sisa cuti ke database.');
      }
    } catch (e: any) {
      console.error('generateSisaCutiNextYear caught error:', e);
      throw e;
    }
  };

  // == CRUD PENGAJUAN ==
  const addPengajuan = async (p: Omit<PengajuanCuti, 'id' | 'status' | 'nomorSurat'> & { nomorSurat?: string }): Promise<PengajuanCuti | null> => {
    let numSurat = p.nomorSurat;
    if (!numSurat) {
      const jcObj = jenisCuti.find(j => j.id === p.jenisCutiId);
      let code = 'CUTI';
      if (jcObj) {
        const nameLower = jcObj.nama.toLowerCase();
        if (nameLower.includes('tahunan')) code = 'THN';
        else if (nameLower.includes('sakit')) code = 'SKT';
        else if (nameLower.includes('melahirkan')) code = 'MLH';
        else if (nameLower.includes('penting') || nameLower.includes('cap')) code = 'CAP';
        else if (nameLower.includes('besar')) code = 'BSR';
        else if (nameLower.includes('luar tanggungan') || nameLower.includes('cltn')) code = 'CLT';
      }
      const randomNum = Math.floor(Math.random() * 900) + 100;
      numSurat = `000.1.2/${randomNum}/SETDA-${code}/${new Date().getFullYear()}`;
    }

    const ttdPemohon = p.ttdDigitalPemohon !== undefined ? p.ttdDigitalPemohon : true;
    const ttdAtasan = p.ttdDigitalAtasan !== undefined ? p.ttdDigitalAtasan : true;
    const ttdPejabat = p.ttdDigitalPejabat !== undefined ? p.ttdDigitalPejabat : true;
    const metodeTtd = p.metodePenandatanganan || (
      (ttdPemohon && !ttdAtasan && !ttdPejabat)
        ? 'HYBRID'
        : ((ttdAtasan && ttdPejabat) ? 'TTE' : 'MANUAL')
    );

    const payload: any = {
      pegawai_id: p.pegawaiId,
      jenis_cuti_id: p.jenisCutiId,
      tanggal_pengajuan: p.tanggalPengajuan,
      tanggal_mulai: p.tanggalMulai,
      tanggal_selesai: p.tanggalSelesai,
      jumlah_hari: p.jumlahHari,
      alasan: p.alasan,
      alamat_selama_cuti: p.alamatSelamaCuti,
      no_telp_hubungi: p.noTelpHubungi,
      berkas_pendukung_url: p.berkasPendukung,
      atasan_id: p.atasanId || null,
      pejabat_id: p.pejabatId || null,
      status: 'Menunggu',
      nomor_surat: numSurat,
      ttd_digital_pemohon: ttdPemohon,
      ttd_digital_atasan: ttdAtasan,
      ttd_digital_pejabat: ttdPejabat,
      metode_penandatanganan: metodeTtd
    };

    let { data, error } = await supabase.from('pengajuan_cuti').insert(payload).select().single();
    if (error) {
      console.warn('Error inserting with TTE columns, retrying fallback:', error.message);
      const fallbackPayload = { ...payload };
      delete fallbackPayload.ttd_digital_pemohon;
      delete fallbackPayload.ttd_digital_atasan;
      delete fallbackPayload.ttd_digital_pejabat;
      delete fallbackPayload.metode_penandatanganan;
      const retry = await supabase.from('pengajuan_cuti').insert(fallbackPayload).select().single();
      if (!retry.error && retry.data) {
        data = {
          ...retry.data,
          ttd_digital_pemohon: ttdPemohon,
          ttd_digital_atasan: ttdAtasan,
          ttd_digital_pejabat: ttdPejabat,
          metode_penandatanganan: metodeTtd
        };
        error = null;
      }
    }

    if (!error && data) {
      const newPj = mapPengajuan(data);
      newPj.ttdDigitalPemohon = ttdPemohon;
      newPj.ttdDigitalAtasan = ttdAtasan;
      newPj.ttdDigitalPejabat = ttdPejabat;
      newPj.metodePenandatanganan = metodeTtd;
      setPengajuan([newPj, ...pengajuan]);
      return newPj;
    }
    console.error(error);
    return null;
  };

  const updatePengajuan = async (id: string, p: Partial<PengajuanCuti>) => {
    const payload: any = {};
    if (p.pegawaiId !== undefined) payload.pegawai_id = p.pegawaiId;
    if (p.jenisCutiId !== undefined) payload.jenis_cuti_id = p.jenisCutiId;
    if (p.tanggalPengajuan !== undefined) payload.tanggal_pengajuan = p.tanggalPengajuan;
    if (p.tanggalMulai !== undefined) payload.tanggal_mulai = p.tanggalMulai;
    if (p.tanggalSelesai !== undefined) payload.tanggal_selesai = p.tanggalSelesai;
    if (p.jumlahHari !== undefined) payload.jumlah_hari = p.jumlahHari;
    if (p.alasan !== undefined) payload.alasan = p.alasan;
    if (p.alamatSelamaCuti !== undefined) payload.alamat_selama_cuti = p.alamatSelamaCuti;
    if (p.noTelpHubungi !== undefined) payload.no_telp_hubungi = p.noTelpHubungi;
    if (p.berkasPendukung !== undefined) payload.berkas_pendukung_url = p.berkasPendukung;
    if (p.atasanId !== undefined) payload.atasan_id = p.atasanId;
    if (p.pejabatId !== undefined) payload.pejabat_id = p.pejabatId;
    if (p.status !== undefined) payload.status = p.status;
    if (p.catatanPerbaikan !== undefined) payload.catatan_atasan = p.catatanPerbaikan;
    if (p.nomorSurat !== undefined) payload.nomor_surat = p.nomorSurat;

    if (p.ttdDigitalPemohon !== undefined) payload.ttd_digital_pemohon = p.ttdDigitalPemohon;
    if (p.ttdDigitalAtasan !== undefined) payload.ttd_digital_atasan = p.ttdDigitalAtasan;
    if (p.ttdDigitalPejabat !== undefined) payload.ttd_digital_pejabat = p.ttdDigitalPejabat;
    if (p.metodePenandatanganan !== undefined) {
      payload.metode_penandatanganan = p.metodePenandatanganan;
    } else if (p.ttdDigitalAtasan !== undefined || p.ttdDigitalPejabat !== undefined) {
      payload.metode_penandatanganan = (p.ttdDigitalPemohon !== false && p.ttdDigitalAtasan === false && p.ttdDigitalPejabat === false)
        ? 'HYBRID'
        : ((p.ttdDigitalAtasan && p.ttdDigitalPejabat) ? 'TTE' : 'MANUAL');
    }

    let { data, error } = await supabase.from('pengajuan_cuti').update(payload).eq('id', id).select().single();
    if (error) {
      console.warn('Error updating with TTE columns, retrying fallback:', error.message);
      const fallbackPayload = { ...payload };
      delete fallbackPayload.ttd_digital_pemohon;
      delete fallbackPayload.ttd_digital_atasan;
      delete fallbackPayload.ttd_digital_pejabat;
      delete fallbackPayload.metode_penandatanganan;
      const retry = await supabase.from('pengajuan_cuti').update(fallbackPayload).eq('id', id).select().single();
      if (!retry.error && retry.data) {
        data = {
          ...retry.data,
          ttd_digital_pemohon: p.ttdDigitalPemohon,
          ttd_digital_atasan: p.ttdDigitalAtasan,
          ttd_digital_pejabat: p.ttdDigitalPejabat
        };
        error = null;
      }
    }

    if (!error && data) {
      const mapped = mapPengajuan(data);
      if (p.pegawaiId !== undefined) mapped.pegawaiId = p.pegawaiId;
      if (p.jenisCutiId !== undefined) mapped.jenisCutiId = p.jenisCutiId;
      if (p.tanggalPengajuan !== undefined) mapped.tanggalPengajuan = p.tanggalPengajuan;
      if (p.ttdDigitalPemohon !== undefined) mapped.ttdDigitalPemohon = p.ttdDigitalPemohon;
      if (p.ttdDigitalAtasan !== undefined) mapped.ttdDigitalAtasan = p.ttdDigitalAtasan;
      if (p.ttdDigitalPejabat !== undefined) mapped.ttdDigitalPejabat = p.ttdDigitalPejabat;
      if (p.metodePenandatanganan !== undefined) {
        mapped.metodePenandatanganan = p.metodePenandatanganan;
      } else if (p.ttdDigitalAtasan !== undefined || p.ttdDigitalPejabat !== undefined) {
        mapped.metodePenandatanganan = (mapped.ttdDigitalPemohon !== false && mapped.ttdDigitalAtasan === false && mapped.ttdDigitalPejabat === false)
          ? 'HYBRID'
          : ((mapped.ttdDigitalAtasan && mapped.ttdDigitalPejabat) ? 'TTE' : 'MANUAL');
      }
      setPengajuan(pengajuan.map(item => item.id === id ? mapped : item));
    } else {
      // Local state fallback in case of connection or table error
      setPengajuan(pengajuan.map(item => item.id === id ? { ...item, ...p } : item));
    }
  };

  const updatePengajuanStatus = async (id: string, status: PengajuanCuti['status'], catatan?: string) => {
    const prevPj = pengajuan.find(p => p.id === id);
    const prevStatus = prevPj?.status;

    const payload: any = { status };
    if (catatan !== undefined) {
      payload.catatan_atasan = catatan;
    }

    const { data, error } = await supabase.from('pengajuan_cuti').update(payload).eq('id', id).select().single();
    if (!error && data) {
      const updatedPj = mapPengajuan(data);
      setPengajuan(pengajuan.map(item => item.id === id ? updatedPj : item));

      const jc = jenisCuti.find(j => j.id === updatedPj.jenisCutiId);
      if (jc && jc.nama.toLowerCase().includes('tahunan')) {
        // Transition to Approved from non-Approved -> deduct from Sisa N
        if (status === 'Disetujui' && prevStatus !== 'Disetujui') {
          await potongSisaCutiTahunan(updatedPj.pegawaiId, updatedPj.jumlahHari);
        }
        // Transition from Approved to non-Approved -> add back to Sisa N
        else if (status !== 'Disetujui' && prevStatus === 'Disetujui') {
          await kembalikanSisaCutiTahunan(updatedPj.pegawaiId, updatedPj.jumlahHari);
        }
      }
    }
  };

  const deletePengajuan = async (id: string) => {
    const target = pengajuan.find(item => item.id === id);
    if (target?.berkasPendukung) {
      const oldPath = getStorageFilePath(target.berkasPendukung);
      if (oldPath) {
        try {
          await supabase.storage.from('berkas_cuti').remove([oldPath]);
        } catch (e) {
          console.warn('Gagal menghapus berkas dari storage:', e);
        }
      }
    }
    const { error } = await supabase.from('pengajuan_cuti').delete().eq('id', id);
    if (!error) setPengajuan(pengajuan.filter(item => item.id !== id));
  };

  const potongSisaCutiTahunan = async (pegawaiId: string, jumlahHari: number) => {
    const sc = sisaCuti.find(s => s.pegawaiId === pegawaiId);
    if (!sc) return;

    const n = sc.sisaN - jumlahHari;
    const payload = { sisa_n: n };
    const { data, error } = await supabase.from('sisa_cuti_tahunan').update(payload).eq('id', sc.id).select().single();
    
    if (!error && data) {
      setSisaCuti(sisaCuti.map(item => item.id === sc.id ? mapSisaCuti(data) : item));
    }
  };

  const kembalikanSisaCutiTahunan = async (pegawaiId: string, jumlahHari: number) => {
    const sc = sisaCuti.find(s => s.pegawaiId === pegawaiId);
    if (!sc) return;

    const n = sc.sisaN + jumlahHari;
    const payload = { sisa_n: n };
    const { data, error } = await supabase.from('sisa_cuti_tahunan').update(payload).eq('id', sc.id).select().single();
    
    if (!error && data) {
      setSisaCuti(sisaCuti.map(item => item.id === sc.id ? mapSisaCuti(data) : item));
    }
  };

  // == INSTANSI UPDATE ==
  const updateInstansi = async (data: PengaturanInstansi) => {
    const payload = {
      nama_instansi: data.namaInstansi,
      alamat: data.alamat,
      telp: data.telp,
      email: data.email,
      website: data.website,
      jabatan_kepala: data.jabatanKepala,
      logo_url: data.logoUrl
    };
    
    const { data: existing } = await supabase.from('pengaturan_instansi').select('id').limit(1).maybeSingle();
    
    if (existing) {
      const { data: updated, error } = await supabase.from('pengaturan_instansi').update(payload).eq('id', existing.id).select().single();
      if (!error && updated) {
        setInstansi({ ...data, namaInstansi: updated.nama_instansi, logoUrl: updated.logo_url || '' });
      }
    } else {
      const { data: inserted, error } = await supabase.from('pengaturan_instansi').insert(payload).select().single();
      if (!error && inserted) {
        setInstansi({ ...data, namaInstansi: inserted.nama_instansi, logoUrl: inserted.logo_url || '' });
      }
    }
  };

  // == USERS CRUD (Mock auth) ==
  const addUser = async (u: Omit<PengaturanUser, 'id'>) => {
    const payload = {
      username: u.username,
      nama: u.nama,
      password: u.password,
      role: u.role,
      pegawai_id: u.pegawaiId || null
    };
    const { data, error } = await supabase.from('users_role').insert([payload]).select().single();
    if (error) {
      console.error('Error add user:', error);
      return;
    }
    const newU: PengaturanUser = {
      id: data.id,
      username: data.username,
      nama: data.nama,
      password: data.password,
      role: data.role,
      pegawaiId: data.pegawai_id
    };
    setUsers([...users, newU]);
  };

  const updateUser = async (id: string, u: Partial<PengaturanUser>) => {
    const payload: any = {};
    if (u.username) payload.username = u.username;
    if (u.nama) payload.nama = u.nama;
    if (u.password) payload.password = u.password;
    if (u.role) payload.role = u.role;
    if (u.pegawaiId !== undefined) payload.pegawai_id = u.pegawaiId;

    const { error } = await supabase.from('users_role').update(payload).eq('id', id);
    if (error) {
      console.error('Error update user:', error);
      return;
    }
    
    const updated = users.map(item => item.id === id ? { ...item, ...u } : item);
    setUsers(updated);
    if (currentUser && currentUser.id === id) {
      const updatedCur = { ...currentUser, ...u };
      setCurrentUser(updatedCur);
      localStorage.setItem('sip_cuti_currentuser', JSON.stringify(updatedCur));
    }
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('users_role').delete().eq('id', id);
    if (error) {
      console.error('Error delete user:', error);
      return;
    }
    setUsers(users.filter(item => item.id !== id));
  };

  const switchUser = (id: string | null) => {
    if (id === null) {
      setCurrentUser(null);
      localStorage.removeItem('sip_cuti_currentuser');
      return;
    }
    const target = users.find(u => u.id === id);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('sip_cuti_currentuser', JSON.stringify(target));
    }
  };

  // == HELPERS ==
  const isCountAllDays = (jcId?: string): boolean => {
    if (!jcId) return false;
    const jc = jenisCuti.find(j => j.id === jcId);
    if (!jc) {
      const lower = jcId.toLowerCase();
      if (lower.includes('sakit') || lower.includes('melahirkan') || lower.includes('besar') || lower.includes('luar tanggungan')) {
        return true;
      }
      return false;
    }
    const nameLower = jc.nama.toLowerCase();
    if (nameLower.includes('sakit') || nameLower.includes('melahirkan') || nameLower.includes('besar') || nameLower.includes('luar tanggungan')) {
      return true;
    }
    return false;
  };

  const hitungHariKerja = (startStr: string, endStr: string, jenisCutiId?: string): number => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    if (start > end) return 0;

    const countAll = isCountAllDays(jenisCutiId);
    if (countAll) {
      let count = 0;
      const current = new Date(start);
      while (current <= end) {
        count++;
        current.setDate(current.getDate() + 1);
      }
      return count;
    }

    let count = 0;
    const current = new Date(start);
    const liburSet = new Set(hariLibur.map(hl => hl.tanggal));
    while (current <= end) {
      const day = current.getDay();
      const dateStr = current.toISOString().split('T')[0];
      const isWeekend = day === 0 || day === 6;
      const isHoliday = liburSet.has(dateStr);
      if (!isWeekend && !isHoliday) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const hitungTanggalSelesai = (startStr: string, days: number, jenisCutiId?: string): string => {
    if (!startStr || days <= 0) return '';
    let count = 0;
    const current = new Date(startStr);
    if (isNaN(current.getTime())) return '';
    const liburSet = new Set(hariLibur.map(hl => hl.tanggal));
    const countAll = isCountAllDays(jenisCutiId);

    while (count < days) {
      const day = current.getDay();
      const tzOffset = current.getTimezoneOffset() * 60000; 
      const localISOTime = (new Date(current.getTime() - tzOffset)).toISOString().slice(0, -1);
      const dateStr = localISOTime.split('T')[0];      
      const isWeekend = day === 0 || day === 6;
      const isHoliday = liburSet.has(dateStr);
      
      if (countAll || (!isWeekend && !isHoliday)) {
        count++;
      }
      if (count < days) {
        current.setDate(current.getDate() + 1);
      }
    }
    const tzOffset2 = current.getTimezoneOffset() * 60000; 
    const localISOTime2 = (new Date(current.getTime() - tzOffset2)).toISOString().slice(0, -1);
    return localISOTime2.split('T')[0];
  };

  const hitungTotalCutiTahunan = (sc: SisaCutiTahunan | undefined): number => {
    if (!sc) return 0;    
    
    if (sc.sisaN < 12) {
      return sc.sisaN;
    }

    let carryN1 = 0;
    let carryN2 = 0;

    if (sc.sisaN1 >= 12) {
      carryN1 = 6;
      if (sc.sisaN2 >= 12) {
        carryN2 = 6;
      }
    }
    
    return sc.sisaN + carryN1 + carryN2;
  };

  const dapatkanRekapCuti = () => {
    return pegawai.map(p => {
      const rekap: { [key: string]: number } = {};      
      jenisCuti.forEach(jc => {
        rekap[jc.id] = 0;
      });
      const disetujui = pengajuan.filter(pj => pj.pegawaiId === p.id && pj.status === 'Disetujui');      
      let totalCutiDiambil = 0;
      disetujui.forEach(pj => {
        if (rekap[pj.jenisCutiId] !== undefined) {
          rekap[pj.jenisCutiId] += pj.jumlahHari;
        } else {
          rekap[pj.jenisCutiId] = pj.jumlahHari;
        }
        totalCutiDiambil += pj.jumlahHari;
      });
      return {
        pegawai: p,
        rekap,
        totalCutiDiambil
      };
    }).filter(item => item.totalCutiDiambil > 0);
  };

  return {
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
  };
}

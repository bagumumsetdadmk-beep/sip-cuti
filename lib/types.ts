export interface Pegawai {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  golongan: string;
  unitKerja: string; // contoh: Bagian Umum, Bagian Organisasi, Bagian Hukum, dll.
  statusPegawai: 'PNS' | 'PPPK' | 'PPPK PW';
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  masaKerja: string; // contoh: "01 Tahun 00 Bulan"
  noHp: string;
  qrCodeUrl?: string; // QR code image URL atau Base64 dari BKPSDM
}

export interface HariLibur {
  id: string;
  tanggal: string; // YYYY-MM-DD
  keterangan: string;
  jenis: 'Libur Nasional' | 'Cuti Bersama';
}

export interface AtasanPejabat {
  id: string;
  pegawaiId: string; // Relasi ke Pegawai
  peran: 'Atasan Langsung' | 'Pejabat Penanggung Jawab' | 'Kedua Peran';
  statusActive: boolean;
}

export interface JenisCuti {
  id: string;
  nama: string;
  kuotaDefault: number; // kuota per tahun
  keterangan: string;
  hakPegawai: 'Semua' | 'PNS' | 'PPPK' | 'PPPK PW';
}

export interface SisaCutiTahunan {
  id: string;
  pegawaiId: string; // Relasi ke Pegawai
  sisaN2: number; // Dua tahun lalu (2024)
  sisaN1: number; // Satu tahun lalu (2025)
  sisaN: number;  // Tahun berjalan (2026)
  tahunN: number; // Tahun N
}

export interface PengajuanCuti {
  id: string;
  nomorSurat: string;
  pegawaiId: string;
  jenisCutiId: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jumlahHari: number;
  alasan: string;
  alamatSelamaCuti: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak' | 'Dalam Perbaikan' | 'Sudah Diperbaiki';
  catatanPerbaikan?: string;
  berkasPendukung?: string; // Base64 or filename
  atasanId: string; // Atasan langsung
  pejabatId: string; // Pejabat yang menandatangani / menyetujui akhir
  tanggalPengajuan: string;
  noTelpHubungi?: string; // no telp yang mudah dihubungi
  ttdDigitalPemohon?: boolean;
  ttdDigitalAtasan?: boolean;
  ttdDigitalPejabat?: boolean;
}

export interface PengaturanInstansi {
  namaInstansi: string;
  alamat: string;
  telp: string;
  email: string;
  website: string;
  namaKepala: string;
  nipKepala: string;
  jabatanKepala: string;
  logoUrl?: string;
}

export interface PengaturanUser {
  id: string;
  username: string;
  nama: string;
  role: 'Admin' | 'Operator' | 'Verifikator';
  password: string;
  pegawaiId?: string; // Menghubungkan user dengan data pegawai tertentu (terutama Operator/Verifikator)
}

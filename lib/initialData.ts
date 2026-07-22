import { Pegawai, HariLibur, AtasanPejabat, JenisCuti, SisaCutiTahunan, PengajuanCuti, PengaturanInstansi, PengaturanUser } from './types';

export const initialPegawai: Pegawai[] = [
  {
    id: 'peg-1',
    nip: '197805122005011002',
    nama: 'Drs. Akhmad Sugiharto, S.T., M.T.',
    jabatan: 'Sekretaris Daerah Kabupaten Demak',
    golongan: 'Pembina Utama Madya (IV/d)',
    unitKerja: 'Sekretariat Daerah',
    statusPegawai: 'PNS',
    jenisKelamin: 'Laki-laki',
    masaKerja: '21 Tahun 06 Bulan',
    noHp: '081234567890'
  },
  {
    id: 'peg-2',
    nip: '198203152008011003',
    nama: 'H. Mohamad Ali, S.Sos.',
    jabatan: 'Kepala Bagian Umum',
    golongan: 'Pembina (IV/a)',
    unitKerja: 'Bagian Umum',
    statusPegawai: 'PNS',
    jenisKelamin: 'Laki-laki',
    masaKerja: '18 Tahun 02 Bulan',
    noHp: '081398765432'
  },
  {
    id: 'peg-3',
    nip: '198511202010122001',
    nama: 'Sri Wahyuni, S.E., M.Si.',
    jabatan: 'Kasubag Rumah Tangga',
    golongan: 'Penata Tingkat I (III/d)',
    unitKerja: 'Bagian Umum',
    statusPegawai: 'PNS',
    jenisKelamin: 'Perempuan',
    masaKerja: '15 Tahun 08 Bulan',
    noHp: '085640123456'
  },
  {
    id: 'peg-4',
    nip: '199008242015031002',
    nama: 'Bagus Setyawan, S.Kom.',
    jabatan: 'Pranata Komputer Ahli Pertama',
    golongan: 'Penata (III/c)',
    unitKerja: 'Bagian Umum',
    statusPegawai: 'PNS',
    jenisKelamin: 'Laki-laki',
    masaKerja: '11 Tahun 04 Bulan',
    noHp: '087831456789'
  },
  {
    id: 'peg-5',
    nip: '199406122021211005',
    nama: 'Rahmat Hidayat, A.Md.',
    jabatan: 'Pengadministrasi Perkantoran',
    golongan: 'Pengatur (II/c)',
    unitKerja: 'Bagian Organisasi',
    statusPegawai: 'PPPK',
    jenisKelamin: 'Laki-laki',
    masaKerja: '05 Tahun 00 Bulan',
    noHp: '082134567123'
  },
  {
    id: 'peg-6',
    nip: '198812042019082002',
    nama: 'Siti Aminah, S.H.',
    jabatan: 'Analis Hukum Ahli Muda',
    golongan: 'Penata (III/c)',
    unitKerja: 'Bagian Hukum',
    statusPegawai: 'PNS',
    jenisKelamin: 'Perempuan',
    masaKerja: '07 Tahun 03 Bulan',
    noHp: '081901234567'
  }
];

export const initialHariLibur: HariLibur[] = [
  { id: 'lib-1', tanggal: '2026-01-01', keterangan: 'Tahun Baru 2026 Masehi', jenis: 'Libur Nasional' },
  { id: 'lib-2', tanggal: '2026-02-16', keterangan: 'Isra Mikraj Nabi Muhammad SAW', jenis: 'Libur Nasional' },
  { id: 'lib-3', tanggal: '2026-02-17', keterangan: 'Tahun Baru Imlek 2577 Kongzili', jenis: 'Libur Nasional' },
  { id: 'lib-4', tanggal: '2026-03-20', keterangan: 'Hari Suci Nyepi (Tahun Baru Saka 1948)', jenis: 'Libur Nasional' },
  { id: 'lib-5', tanggal: '2026-03-23', keterangan: 'Cuti Bersama Hari Suci Nyepi', jenis: 'Cuti Bersama' },
  { id: 'lib-6', tanggal: '2026-04-03', keterangan: 'Wafat Yesus Kristus', jenis: 'Libur Nasional' },
  { id: 'lib-7', tanggal: '2026-04-16', keterangan: 'Cuti Bersama Hari Raya Idul Fitri 1447 H', jenis: 'Cuti Bersama' },
  { id: 'lib-8', tanggal: '2026-04-17', keterangan: 'Cuti Bersama Hari Raya Idul Fitri 1447 H', jenis: 'Cuti Bersama' },
  { id: 'lib-9', tanggal: '2026-04-20', keterangan: 'Hari Raya Idul Fitri 1447 Hijriah', jenis: 'Libur Nasional' },
  { id: 'lib-10', tanggal: '2026-04-21', keterangan: 'Hari Raya Idul Fitri 1447 Hijriah', jenis: 'Libur Nasional' },
  { id: 'lib-11', tanggal: '2026-05-01', keterangan: 'Hari Buruh Internasional', jenis: 'Libur Nasional' },
  { id: 'lib-12', tanggal: '2026-05-14', keterangan: 'Kenaikan Yesus Kristus', jenis: 'Libur Nasional' },
  { id: 'lib-13', tanggal: '2026-05-25', keterangan: 'Cuti Bersama Hari Raya Waisak 2570 BE', jenis: 'Cuti Bersama' },
  { id: 'lib-14', tanggal: '2026-05-26', keterangan: 'Hari Raya Waisak 2570 BE', jenis: 'Libur Nasional' },
  { id: 'lib-15', tanggal: '2026-06-01', keterangan: 'Hari Lahir Pancasila', jenis: 'Libur Nasional' },
  { id: 'lib-16', tanggal: '2026-08-17', keterangan: 'Hari Kemerdekaan Republik Indonesia', jenis: 'Libur Nasional' }
];

export const initialAtasanPejabat: AtasanPejabat[] = [
  { id: 'ap-1', pegawaiId: 'peg-1', peran: 'Pejabat Penanggung Jawab', statusActive: true },
  { id: 'ap-2', pegawaiId: 'peg-2', peran: 'Kedua Peran', statusActive: true },
  { id: 'ap-3', pegawaiId: 'peg-3', peran: 'Atasan Langsung', statusActive: true }
];

export const initialJenisCuti: JenisCuti[] = [
  { id: 'jc-1', nama: 'Cuti Tahunan', kuotaDefault: 12, keterangan: 'Hak cuti tahunan diberikan sebanyak 12 hari kerja.', hakPegawai: 'Semua' },
  { id: 'jc-2', nama: 'Cuti Sakit', kuotaDefault: 14, keterangan: 'Hak cuti sakit jika sakit lebih dari 1-14 hari dengan surat dokter.', hakPegawai: 'Semua' },
  { id: 'jc-3', nama: 'Cuti Melahirkan', kuotaDefault: 90, keterangan: 'Diberikan untuk persalinan pertama sampai ketiga sebanyak 3 bulan.', hakPegawai: 'Semua' },
  { id: 'jc-4', nama: 'Cuti Alasan Penting', kuotaDefault: 15, keterangan: 'Diberikan karena keluarga sakit keras, meninggal, melangsungkan pernikahan, dll.', hakPegawai: 'Semua' },
  { id: 'jc-5', nama: 'Cuti Besar', kuotaDefault: 90, keterangan: 'Diberikan kepada PNS yang telah bekerja paling sedikit 6 tahun secara terus menerus.', hakPegawai: 'PNS' },
  { id: 'jc-6', nama: 'Cuti di Luar Tanggungan Negara', kuotaDefault: 1095, keterangan: 'Diberikan karena alasan pribadi mendesak setelah bekerja paling sedikit 5 tahun.', hakPegawai: 'PNS' }
];

export const initialSisaCutiTahunan: SisaCutiTahunan[] = [
  { id: 'sc-1', pegawaiId: 'peg-1', sisaN2: 6, sisaN1: 6, sisaN: 12, tahunN: new Date().getFullYear() },
  { id: 'sc-2', pegawaiId: 'peg-2', sisaN2: 4, sisaN1: 5, sisaN: 12, tahunN: new Date().getFullYear() },
  { id: 'sc-3', pegawaiId: 'peg-3', sisaN2: 3, sisaN1: 6, sisaN: 12, tahunN: new Date().getFullYear() },
  { id: 'sc-4', pegawaiId: 'peg-4', sisaN2: 5, sisaN1: 4, sisaN: 12, tahunN: new Date().getFullYear() },
  { id: 'sc-5', pegawaiId: 'peg-5', sisaN2: 0, sisaN1: 2, sisaN: 12, tahunN: new Date().getFullYear() }, // PPPK biasanya tidak berakumulasi sisaN2/N1 setebal PNS
  { id: 'sc-6', pegawaiId: 'peg-6', sisaN2: 6, sisaN1: 6, sisaN: 12, tahunN: new Date().getFullYear() }
];

export const initialPengajuanCuti: PengajuanCuti[] = [
  {
    id: 'pc-1',
    nomorSurat: '000.1.2/104/BAG-UM/2026',
    pegawaiId: 'peg-4',
    jenisCutiId: 'jc-1',
    tanggalMulai: '2026-07-20',
    tanggalSelesai: '2026-07-22',
    jumlahHari: 3,
    alasan: 'Acara pernikahan adik kandung di Solo',
    alamatSelamaCuti: 'Jl. Slamet Riyadi No. 45, Surakarta, Jawa Tengah',
    status: 'Disetujui',
    atasanId: 'peg-3',
    pejabatId: 'peg-2',
    tanggalPengajuan: '2026-07-10'
  },
  {
    id: 'pc-2',
    nomorSurat: '000.1.2/115/BAG-UM/2026',
    pegawaiId: 'peg-5',
    jenisCutiId: 'jc-1',
    tanggalMulai: '2026-08-03',
    tanggalSelesai: '2026-08-04',
    jumlahHari: 2,
    alasan: 'Keperluan keluarga penting ke Yogyakarta',
    alamatSelamaCuti: 'Jl. Malioboro No. 12, Yogyakarta',
    status: 'Menunggu',
    atasanId: 'peg-2',
    pejabatId: 'peg-1',
    tanggalPengajuan: '2026-07-12'
  },
  {
    id: 'pc-3',
    nomorSurat: '000.1.2/120/BAG-UM/2026',
    pegawaiId: 'peg-6',
    jenisCutiId: 'jc-2',
    tanggalMulai: '2026-07-06',
    tanggalSelesai: '2026-07-08',
    jumlahHari: 3,
    alasan: 'Rawat inap karena demam berdarah di RSUD Demak',
    alamatSelamaCuti: 'Perum Geriya Bhakti Praja Blok B-12, Demak',
    status: 'Disetujui',
    berkasPendukung: 'surat_sakit_siti.pdf',
    ttdDigitalPemohon: true,
    ttdDigitalAtasan: true,
    ttdDigitalPejabat: true,
    atasanId: 'peg-2',
    pejabatId: 'peg-1',
    tanggalPengajuan: '2026-07-04'
  },
  {
    id: 'pc-4',
    nomorSurat: '000.1.2/125/BAG-UM/2026',
    pegawaiId: 'peg-3',
    jenisCutiId: 'jc-1',
    tanggalMulai: '2026-07-27',
    tanggalSelesai: '2026-07-29',
    jumlahHari: 3,
    alasan: 'Mengantar anak pendaftaran kuliah di Bandung',
    alamatSelamaCuti: 'Hotel Geulis, Jl. Dago No. 90, Bandung',
    status: 'Dalam Perbaikan',
    catatanPerbaikan: 'Silakan lampirkan bukti pendaftaran/jadwal jika cuti tahunan ini mepet, atau ganti atasan langsung ke Kabag Umum.',
    atasanId: 'peg-2',
    pejabatId: 'peg-1',
    tanggalPengajuan: '2026-07-13'
  }
];

export const defaultPengaturanInstansi: PengaturanInstansi = {
  namaInstansi: 'Sekretariat Daerah Kabupaten Demak',
  alamat: 'Jl. Kyai Singgkil No. 7, Demak, Jawa Tengah 59511',
  telp: '(0291) 685112',
  email: 'setda@demakkab.go.id',
  website: 'https://setda.demakkab.go.id',
  namaKepala: 'Drs. Akhmad Sugiharto, S.T., M.T.',
  nipKepala: '197805122005011002',
  jabatanKepala: 'Sekretaris Daerah Kabupaten Demak',
  logoUrl: '/assets/logo-demak.png'
};

export const initialUsers: PengaturanUser[] = [
  {
    id: 'u-1',
    username: 'admin',
    nama: 'Administrator Setda',
    role: 'Admin',
    password: 'admin123'
  },
  {
    id: 'u-2',
    username: 'operator',
    nama: 'Bagus Setyawan, S.Kom. (Operator)',
    role: 'Operator',
    password: 'operator',
    pegawaiId: 'peg-4'
  },
  {
    id: 'u-3',
    username: 'verifikator',
    nama: 'H. Mohamad Ali, S.Sos. (Verifikator)',
    role: 'Verifikator',
    password: 'verifikator',
    pegawaiId: 'peg-2'
  },
  {
    id: 'u-4',
    username: 'atasan',
    nama: 'H. Mohamad Ali, S.Sos. (Kabag Umum / Atasan Langsung)',
    role: 'Atasan',
    password: 'atasan',
    pegawaiId: 'peg-2'
  },
  {
    id: 'u-5',
    username: 'pejabat',
    nama: 'Drs. Akhmad Sugiharto, S.T., M.T. (Sekda / Pejabat Final)',
    role: 'Pejabat',
    password: 'pejabat',
    pegawaiId: 'peg-1'
  }
];

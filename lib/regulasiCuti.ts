export interface AturanPenguranganCuti {
  id: string;
  namaJenis: string;
  singkatan: string;
  kuotaStandar: string;
  kuotaAngka: number;
  satuanHari: 'Hari Kerja' | 'Hari Kalender';
  pengaruhCutiTahunan: 'Mengurangi Cuti Tahunan' | 'Tidak Mengurangi Cuti Tahunan' | 'Menghilangkan Hak Cuti Tahunan';
  sifatAkumulasi: 'Akumulasi Multi-Tahun (s.d N-2)' | 'Hangus di Akhir Tahun' | 'Per Kasus / Kejadian' | 'Tidak Berakumulasi';
  urutanPemotongan: string;
  sistemPengurangan: string;
  hakPegawai: 'Semua ASN (PNS, PPPK, PPPK PW)' | 'Khusus PNS' | 'Khusus PNS Wanita / PPPK Wanita';
  syaratMasaKerja: string;
  dasarHukum: string;
  poinPenting: string[];
}

export const REGULASI_PENGURANGAN_CUTI_BKN: AturanPenguranganCuti[] = [
  {
    id: 'jc-1',
    namaJenis: 'Cuti Tahunan',
    singkatan: 'CT',
    kuotaStandar: '12 Hari Kerja per tahun',
    kuotaAngka: 12,
    satuanHari: 'Hari Kerja',
    pengaruhCutiTahunan: 'Mengurangi Cuti Tahunan',
    sifatAkumulasi: 'Akumulasi Multi-Tahun (s.d N-2)',
    urutanPemotongan: 'Sisa Tahun Berjalan (N) → Sisa Tahun Lalu (N-1) → Sisa Dua Tahun Lalu (N-2)',
    sistemPengurangan: 'Pengurangan dilakukan bertahap: memotong saldo N terlebih dahulu hingga habis. Jika N = 0 dan masih ada hari cuti yang diambil, memotong saldo N-1 (maksimal 6 hari diakui). Jika N-1 habis dan N-2 sah utuh 12 hari, memotong N-2. Hari Sabtu, Minggu, Libur Nasional, dan Cuti Bersama TIDAK dihitung sebagai hari cuti (tidak mengurangi kuota).',
    hakPegawai: 'Semua ASN (PNS, PPPK, PPPK PW)',
    syaratMasaKerja: 'Paling sedikit 1 (satu) tahun secara terus-menerus',
    dasarHukum: 'Peraturan BKN No. 24 Tahun 2017 Pasal 4-13 jo Peraturan BKN No. 7 Tahun 2021; PP No. 11/2017 Pasal 310-316; PP No. 49/2018 Pasal 77-80',
    poinPenting: [
      'Hak cuti tahunan diberikan 12 hari kerja dalam tahun berjalan (N).',
      'Akumulasi N-1: jika sisa N-1 ≥ 6 hari, hanya dapat diakumulasikan maksimal 6 hari. Jika sisa N-1 < 6 hari, diakumulasikan sebesar sisa riilnya.',
      'Akumulasi N-2: jika sisa N-2 < 12 hari atau pada tahun N-1 pernah mengambil cuti tahunan, maka sisa N-2 otomatis HANGUS (gugur). Hanya diakui (6 hari) jika 2 tahun berturut-turut utuh 12 hari (maks total 24 hari).',
      'Khusus PPPK: Cuti tahunan 12 hari kerja tidak dapat diakumulasikan ke tahun berikutnya (hangus bila tidak digunakan pada tahun berjalan sesuai PP 49/2018).'
    ]
  },
  {
    id: 'jc-2',
    namaJenis: 'Cuti Sakit',
    singkatan: 'CS',
    kuotaStandar: '1 s.d. 14 hari (surat dokter) / s.d. 1 tahun (tim penguji)',
    kuotaAngka: 14,
    satuanHari: 'Hari Kalender',
    pengaruhCutiTahunan: 'Tidak Mengurangi Cuti Tahunan',
    sifatAkumulasi: 'Hangus di Akhir Tahun',
    urutanPemotongan: 'Memotong Kuota Cuti Sakit Berjalan (Tersendiri)',
    sistemPengurangan: 'Pengurangan kuota dihitung per hari kalender berturut-turut. Penggunaan Cuti Sakit sama sekali TIDAK MEMOTONG kuota Cuti Tahunan pegawai. Apabila sakit lebih dari 14 hari, PNS wajib melampirkan surat penguji kesehatan resmi dan dapat diberikan hak cuti sakit paling lama 1 tahun (dapat diperpanjang 6 bulan).',
    hakPegawai: 'Semua ASN (PNS, PPPK, PPPK PW)',
    syaratMasaKerja: 'Tanpa batas minimum masa kerja',
    dasarHukum: 'Peraturan BKN No. 24 Tahun 2017 Pasal 14-19; PP No. 11/2017 Pasal 317-324; PP No. 49/2018 Pasal 82-84',
    poinPenting: [
      'Sakit 1 hari: memberitahukan secara tertulis kepada atasan disertai surat dokter.',
      'Sakit lebih dari 1 s.d. 14 hari: berhak atas cuti sakit dengan melampirkan surat keterangan dokter pemerintah/swasta.',
      'Sakit lebih dari 14 hari s.d. 1 tahun: harus melalui pemeriksaan Tim Penguji Kesehatan (TPK) yang ditunjuk Menteri Kesehatan.',
      'PNS yang mengalami gugur kandungan berhak atas Cuti Sakit paling lama 1,5 (satu setengah) bulan.',
      'Saldo cuti tahunan pegawai tetap utuh dan tidak terpotong.'
    ]
  },
  {
    id: 'jc-3',
    namaJenis: 'Cuti Melahirkan',
    singkatan: 'CM',
    kuotaStandar: '3 (tiga) Bulan (90 Hari Kalender)',
    kuotaAngka: 90,
    satuanHari: 'Hari Kalender',
    pengaruhCutiTahunan: 'Tidak Mengurangi Cuti Tahunan',
    sifatAkumulasi: 'Per Kasus / Kejadian',
    urutanPemotongan: 'Memotong Kuota Cuti Melahirkan (Per Kelahiran Anak ke-1 s.d ke-3)',
    sistemPengurangan: 'Dihitung 3 bulan penuh kalender terhitung sejak mulai tanggal cuti persalinan. TIDAK MENGURANGI saldo Cuti Tahunan pegawai. PNS wanita yang mengambil Cuti Melahirkan tetap berhak menggunakan 12 hari cuti tahunan pada tahun tersebut.',
    hakPegawai: 'Khusus PNS Wanita / PPPK Wanita',
    syaratMasaKerja: 'Tanpa batas minimum masa kerja',
    dasarHukum: 'Peraturan BKN No. 24 Tahun 2017 Pasal 20-22; PP No. 11/2017 Pasal 325-327; PP No. 49/2018 Pasal 85-87',
    poinPenting: [
      'Diberikan untuk persalinan anak pertama sampai dengan anak ketiga.',
      'Lamanya cuti adalah 3 (tiga) bulan kalender.',
      'Untuk persalinan anak keempat dan seterusnya bagi PNS wanita tidak diberikan cuti melahirkan, melainkan diberikan hak Cuti Besar (jika memenuhi syarat) atau Cuti di Luar Tanggungan Negara.',
      'Saldo cuti tahunan tetap utuh 100% dan tetap bisa digunakan sebelum atau sesudah cuti melahirkan.'
    ]
  },
  {
    id: 'jc-4',
    namaJenis: 'Cuti Alasan Penting',
    singkatan: 'CAP',
    kuotaStandar: 'Maksimal 1 (satu) Bulan (15 - 30 Hari Kerja)',
    kuotaAngka: 15,
    satuanHari: 'Hari Kerja',
    pengaruhCutiTahunan: 'Tidak Mengurangi Cuti Tahunan',
    sifatAkumulasi: 'Per Kasus / Kejadian',
    urutanPemotongan: 'Memotong Kuota Alasan Penting Tersendiri per Kasus',
    sistemPengurangan: 'Dihitung berdasarkan jumlah hari kerja yang diajukan sesuai bukti pendukung sah. Pada prinsipnya TIDAK MENGURANGI kuota Cuti Tahunan, kecuali ditentukan lain jika pemohon telah menghabiskan opsi lain. Diberikan paling lama 1 bulan tergantung tingkat urgensi alasan yang diajukan.',
    hakPegawai: 'Khusus PNS',
    syaratMasaKerja: 'Tanpa batas minimum masa kerja',
    dasarHukum: 'Peraturan BKN No. 24 Tahun 2017 Pasal 23-28; PP No. 11/2017 Pasal 328-333 (PPPK tidak memiliki hak Cuti Alasan Penting berdasarkan PP No. 49/2018)',
    poinPenting: [
      'Khusus bagi Pegawai Negeri Sipil (PNS). Berdasarkan PP No. 49 Tahun 2018 tentang Manajemen PPPK, PPPK tidak berhak atas Cuti Alasan Penting.',
      'Kriteria alasan penting yang sah bagi PNS:',
      '1. Ibu, bapak, isteri/suami, anak, adik, kakak, mertua, atau menantu sakit keras atau meninggal dunia.',
      '2. Salah seorang anggota keluarga yang meninggal dunia dan menurut hukum yang bersangkutan harus mengurus hak-haknya.',
      '3. Melangsungkan perkawinan (pertama).',
      '4. Mengalami musibah kebakaran rumah atau bencana alam.',
      '5. PNS pria yang isterinya melahirkan secara operasi caesar/komplikasi (paling lama 1 bulan).',
      'Pengambilan CAP tidak membatalkan atau memotong hak cuti tahunan PNS.'
    ]
  },
  {
    id: 'jc-5',
    namaJenis: 'Cuti Besar',
    singkatan: 'CB',
    kuotaStandar: '3 (tiga) Bulan (90 Hari Kalender)',
    kuotaAngka: 90,
    satuanHari: 'Hari Kalender',
    pengaruhCutiTahunan: 'Menghilangkan Hak Cuti Tahunan',
    sifatAkumulasi: 'Tidak Berakumulasi',
    urutanPemotongan: 'Meniadakan Hak Cuti Tahunan Tahun Berjalan',
    sistemPengurangan: 'ATURAN KRITIS BKN: PNS yang menggunakan hak Cuti Besar TIDAK BERHAK LAGI atas Cuti Tahunan dalam tahun yang bersangkutan. Jika PNS telah mengambil sebagian Cuti Tahunan sebelum Cuti Besar, maka sisa kuota Cuti Tahunan tahun tersebut otomatis dinolkan (ditiadakan). Sisa Cuti Tahunan tahun sebelumnya (N-1 dan N-2) yang belum diambil tetap dapat digunakan jika masih sah.',
    hakPegawai: 'Khusus PNS',
    syaratMasaKerja: 'Telah bekerja paling sedikit 5 (lima) tahun secara terus-menerus',
    dasarHukum: 'Peraturan BKN No. 24 Tahun 2017 Pasal 29-33 jo Peraturan BKN No. 7 Tahun 2021; PP No. 11/2017 Pasal 315 & 316',
    poinPenting: [
      'Diberikan selama 3 (tiga) bulan kalender.',
      'Syarat telah mengabdi paling sedikit 5 tahun berturut-turut pada instansi pemerintah.',
      'PNS yang menggunakan Cuti Besar dibebaskan dari tugas jabatan dan menerima penghasilan tanpa tunjangan kinerja / tunjangan jabatan penuh sesuai aturan daerah.',
      'KONSEKUENSI PENGURANGAN: Menghilangkan hak Cuti Tahunan pada tahun yang bersangkutan.',
      'PPPK TIDAK MEMILIKI HAK Cuti Besar (sesuai PP No. 49 Tahun 2018).'
    ]
  },
  {
    id: 'jc-6',
    namaJenis: 'Cuti di Luar Tanggungan Negara',
    singkatan: 'CLTN',
    kuotaStandar: 'Maksimal 3 (tiga) Tahun, dapat diperpanjang 1 Tahun',
    kuotaAngka: 1095,
    satuanHari: 'Hari Kalender',
    pengaruhCutiTahunan: 'Menghilangkan Hak Cuti Tahunan',
    sifatAkumulasi: 'Tidak Berakumulasi',
    urutanPemotongan: 'Menonaktifkan Hak Seluruh Cuti & Menangguhkan Status Pegawai',
    sistemPengurangan: 'CLTN mengakibatkan PNS dibebaskan sementara dari jabatan organiknya. Selama masa CLTN, PNS tidak menerima penghasilan apa pun dari negara dan masa kerja selama CLTN tidak dihitung sebagai masa kerja PNS. Hak Cuti Tahunan maupun cuti lainnya ditiadakan selama masa CLTN.',
    hakPegawai: 'Khusus PNS',
    syaratMasaKerja: 'Telah bekerja paling sedikit 5 (lima) tahun secara terus-menerus',
    dasarHukum: 'Peraturan BKN No. 24 Tahun 2017 Pasal 34-40; PP No. 11/2017 Pasal 334-340',
    poinPenting: [
      'Diberikan untuk alasan pribadi yang penting dan mendesak (contoh: mendampingi suami/istri tugas dinas/belajar ke luar negeri, mendampingi suami/istri pengobatan, program anak, mendampingi orang tua sakit tua/uzur).',
      'Persetujuan wajib mendapatkan pertimbangan teknis dari Kepala BKN Pusat.',
      'Selama CLTN, PNS tidak berhak menerima penghasilan dan fasilitas negara.',
      'Tidak memiliki kuota cuti tahunan selama masa penangguhan.'
    ]
  },
  {
    id: 'jc-7',
    namaJenis: 'Cuti Bersama',
    singkatan: 'CB-NAS',
    kuotaStandar: 'Ditetapkan setiap tahun oleh SKB 3 Menteri / Keppres',
    kuotaAngka: 0,
    satuanHari: 'Hari Kerja',
    pengaruhCutiTahunan: 'Tidak Mengurangi Cuti Tahunan',
    sifatAkumulasi: 'Hangus di Akhir Tahun',
    urutanPemotongan: 'Libur Resmi Tambahan (Bebas Potong Saldo Tahunan)',
    sistemPengurangan: 'Berdasarkan Keputusan Presiden Republik Indonesia tentang Penetapan Cuti Bersama Pegawai ASN, Cuti Bersama Pegawai ASN TIDAK MENGURANGI hak Cuti Tahunan PNS/PPPK. Pegawai ASN yang karena jabatannya tidak dapat memanfaatkan cuti bersama (misal layanan darurat/RS/Satpol PP), hak cuti tahunannya ditambah sejumlah hari cuti bersama yang tidak digunakan tersebut.',
    hakPegawai: 'Semua ASN (PNS, PPPK, PPPK PW)',
    syaratMasaKerja: 'Tanpa batas minimum masa kerja',
    dasarHukum: 'Keppres Cuti Bersama ASN Tahunan; PP No. 11 Tahun 2017 Pasal 333 ayat (2) & ayat (3)',
    poinPenting: [
      'Bagi ASN, Cuti Bersama resmi TIDAK MEMOTONG hak 12 hari Cuti Tahunan.',
      'Berbeda dengan karyawan swasta di UU Ketenagakerjaan di mana cuti bersama memotong cuti tahunan, bagi ASN berlaku ketentuan khusus Keppres ASN.',
      'Dalam aplikasi SIP-CUTI, tanggal Cuti Bersama otomatis didaftarkan pada Master Hari Libur dan dikecualikan dari perhitungan hari pengajuan cuti tahunan.'
    ]
  }
];

export function getAturanCuti(namaAtauId: string): AturanPenguranganCuti | undefined {
  const query = namaAtauId.toLowerCase().trim();
  return REGULASI_PENGURANGAN_CUTI_BKN.find(r => 
    r.id.toLowerCase() === query ||
    r.namaJenis.toLowerCase().includes(query) ||
    query.includes(r.namaJenis.toLowerCase()) ||
    query.includes(r.singkatan.toLowerCase())
  );
}

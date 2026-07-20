-- Schema Database Si-Cuti Setda Kabupaten Demak

-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabel Pengaturan Instansi
CREATE TABLE pengaturan_instansi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_instansi VARCHAR(255) NOT NULL,
  alamat TEXT,
  telp VARCHAR(50),
  email VARCHAR(100),
  website VARCHAR(100),
  jabatan_kepala VARCHAR(100),
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Jenis Cuti
CREATE TABLE jenis_cuti (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(100) NOT NULL,
  kuota_default INTEGER NOT NULL DEFAULT 0,
  satuan VARCHAR(20) DEFAULT 'Hari Kerja',
  deskripsi TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Pegawai
CREATE TABLE pegawai (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nip VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  jabatan VARCHAR(255) NOT NULL,
  unit_kerja VARCHAR(255) NOT NULL,
  masa_kerja VARCHAR(100),
  status_pegawai VARCHAR(50) CHECK (status_pegawai IN ('PNS', 'PPPK')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Atasan Pejabat
CREATE TABLE atasan_pejabat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pegawai_id UUID REFERENCES pegawai(id) ON DELETE CASCADE,
  peran VARCHAR(100) NOT NULL CHECK (peran IN ('Atasan Langsung', 'Pejabat Penanggung Jawab', 'Kedua Peran')),
  status_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Sisa Cuti Tahunan
CREATE TABLE sisa_cuti_tahunan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pegawai_id UUID REFERENCES pegawai(id) ON DELETE CASCADE,
  tahun_n INTEGER NOT NULL,
  sisa_n2 INTEGER DEFAULT 0,
  sisa_n1 INTEGER DEFAULT 0,
  sisa_n INTEGER DEFAULT 12,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pegawai_id, tahun_n)
);

-- Tabel Pengajuan Cuti
CREATE TABLE pengajuan_cuti (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pegawai_id UUID REFERENCES pegawai(id) ON DELETE CASCADE,
  jenis_cuti_id UUID REFERENCES jenis_cuti(id) ON DELETE RESTRICT,
  alasan TEXT,
  tanggal_pengajuan DATE NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  jumlah_hari INTEGER NOT NULL,
  alamat_selama_cuti TEXT,
  no_telp_hubungi VARCHAR(50),
  berkas_pendukung_url TEXT,
  atasan_id UUID REFERENCES pegawai(id) ON DELETE SET NULL,
  pejabat_id UUID REFERENCES pegawai(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'Menunggu Verifikasi',
  catatan_atasan TEXT,
  catatan_pejabat TEXT,
  nomor_surat VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Users (Bisa digabung dengan auth.users bawaan supabase, tapi ini tabel custom utk melengkapi role)
CREATE TABLE users_role (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Verifikator', 'Operator')),
  pegawai_id UUID REFERENCES pegawai(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE pengaturan_instansi ENABLE ROW LEVEL SECURITY;
ALTER TABLE jenis_cuti ENABLE ROW LEVEL SECURITY;
ALTER TABLE pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE atasan_pejabat ENABLE ROW LEVEL SECURITY;
ALTER TABLE sisa_cuti_tahunan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengajuan_cuti ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_role ENABLE ROW LEVEL SECURITY;

-- Kebijakan dasar (Bisa disesuaikan lebih ketat nanti sesuai kebutuhan bisnis)
CREATE POLICY "Enable read access for all authenticated users" ON pengaturan_instansi FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for all authenticated users" ON jenis_cuti FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for all authenticated users" ON pegawai FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for all authenticated users" ON atasan_pejabat FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for all authenticated users" ON sisa_cuti_tahunan FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for all authenticated users" ON pengajuan_cuti FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for all authenticated users" ON users_role FOR SELECT TO authenticated USING (true);

-- Insert data dummy awal (Opsional)
INSERT INTO pengaturan_instansi (nama_instansi, alamat, telp, email, website, jabatan_kepala)
VALUES ('Sekretariat Daerah Kabupaten Demak', 'Jl. Kyai Singkil No. 16, Demak', '0291-123456', 'setda@demakkab.go.id', 'setda.demakkab.go.id', 'Asisten Administrasi Umum Sekda');

INSERT INTO jenis_cuti (nama, kuota_default, satuan)
VALUES 
('Cuti Tahunan', 12, 'Hari Kerja'),
('Cuti Sakit', 0, 'Hari'),
('Cuti Melahirkan', 0, 'Hari'),
('Cuti Karena Alasan Penting', 0, 'Hari'),
('Cuti Besar', 0, 'Hari'),
('Cuti di Luar Tanggungan Negara', 0, 'Bulan');

-- Membuat bucket untuk penyimpanan berkas pendukung
-- Catatan: Perlu dipastikan module storage aktif pada Supabase
INSERT INTO storage.buckets (id, name, public) 
VALUES ('berkas_cuti', 'berkas_cuti', true)
ON CONFLICT (id) DO NOTHING;

-- Policies untuk Storage
CREATE POLICY "Enable public access to read berkas" ON storage.objects FOR SELECT USING (bucket_id = 'berkas_cuti');
CREATE POLICY "Enable authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'berkas_cuti');

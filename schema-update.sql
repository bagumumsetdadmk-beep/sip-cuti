-- schema-update.sql
-- Silakan jalankan query SQL ini di Supabase SQL Editor Anda untuk melengkapi tabel dan mengatasi masalah RLS

-- 1. Kolom tambahan untuk tabel pegawai
ALTER TABLE pegawai ADD COLUMN IF NOT EXISTS golongan VARCHAR(50);
ALTER TABLE pegawai ADD COLUMN IF NOT EXISTS jenis_kelamin VARCHAR(20) DEFAULT 'Laki-laki';
ALTER TABLE pegawai ADD COLUMN IF NOT EXISTS no_hp VARCHAR(50);

-- 2. Kolom hak_pegawai untuk jenis cuti
ALTER TABLE jenis_cuti ADD COLUMN IF NOT EXISTS hak_pegawai VARCHAR(50) DEFAULT 'Semua';

-- 3. Tabel Hari Libur Nasional & Cuti Bersama
CREATE TABLE IF NOT EXISTS hari_libur (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tanggal DATE NOT NULL,
  keterangan TEXT NOT NULL,
  jenis VARCHAR(50) DEFAULT 'Libur Nasional',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload schema';

-- 5. Perbaikan Akses Storage (Prototype Only)
-- Agar upload file bisa dilakukan tanpa auth lengkap di tahap prototype
DROP POLICY IF EXISTS "Enable authenticated uploads" ON storage.objects;
CREATE POLICY "Enable ALL uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'berkas_cuti');
-- Drop the table since it is empty and we want to change its structure
DROP TABLE IF EXISTS users_role CASCADE;

CREATE TABLE users_role (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Verifikator', 'Operator')),
  pegawai_id UUID REFERENCES pegawai(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users_role ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable ALL access for all users" ON users_role FOR ALL USING (true) WITH CHECK (true);

-- Insert default users
INSERT INTO users_role (username, nama, password, role)
VALUES 
('admin', 'Administrator Setda', 'admin123', 'Admin');

-- Note: for operator and verifikator, they might need pegawai_id. We leave them null for now, or they can be created via UI.
INSERT INTO users_role (username, nama, password, role)
VALUES 
('operator', 'Operator Setda', 'operator', 'Operator'),
('verifikator', 'Verifikator Setda', 'verifikator', 'Verifikator');

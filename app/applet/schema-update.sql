-- schema-update.sql
-- Silakan jalankan query SQL ini di Supabase SQL Editor Anda untuk melengkapi tabel dan mengatasi masalah RLS

-- 1. Kolom tambahan untuk tabel pegawai (Menyesuaikan dengan Tipe Data TypeScript kita)
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

-- 4. PERBAIKAN ROW LEVEL SECURITY (RLS)
-- CATATAN PENTING: Karena aplikasi ini menggunakan simulasi role/akun secara lokal (bukan integrasi auth Supabase penuh), 
-- kueri yang dikirim menggunakan anon key secara default ditolak untuk operasi INSERT/UPDATE/DELETE.
-- Untuk mengatasi hal tersebut di tahap pengembangan, kita memperbarui policy RLS agar mengizinkan akses anon.

-- Hapus kebijakan yang lama jika ada agar aman dijalankan berulang kali (Idempotent)
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON pengaturan_instansi;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON jenis_cuti;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON pegawai;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON atasan_pejabat;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON sisa_cuti_tahunan;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON pengajuan_cuti;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON users_role;

DROP POLICY IF EXISTS "Enable ALL access for all users" ON pengaturan_instansi;
DROP POLICY IF EXISTS "Enable ALL access for all users" ON jenis_cuti;
DROP POLICY IF EXISTS "Enable ALL access for all users" ON pegawai;
DROP POLICY IF EXISTS "Enable ALL access for all users" ON atasan_pejabat;
DROP POLICY IF EXISTS "Enable ALL access for all users" ON sisa_cuti_tahunan;
DROP POLICY IF EXISTS "Enable ALL access for all users" ON pengajuan_cuti;
DROP POLICY IF EXISTS "Enable ALL access for all users" ON users_role;
DROP POLICY IF EXISTS "Enable ALL access for all users" ON hari_libur;

-- Kebijakan akses penuh untuk tahap prototype
CREATE POLICY "Enable ALL access for all users" ON pengaturan_instansi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL access for all users" ON jenis_cuti FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL access for all users" ON pegawai FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL access for all users" ON atasan_pejabat FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL access for all users" ON sisa_cuti_tahunan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL access for all users" ON pengajuan_cuti FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL access for all users" ON users_role FOR ALL USING (true) WITH CHECK (true);

-- Policy RLS untuk tabel hari_libur
ALTER TABLE hari_libur ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable ALL access for all users" ON hari_libur FOR ALL USING (true) WITH CHECK (true);

-- 5. Perbaikan Akses Storage (Prototype/Development)
-- Agar upload logo instansi dan berkas pendukung dapat dilakukan melalui bucket 'berkas_cuti' secara publik
DROP POLICY IF EXISTS "Enable public access to read berkas" ON storage.objects;
DROP POLICY IF EXISTS "Enable authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Enable ALL uploads" ON storage.objects;
DROP POLICY IF EXISTS "Give full access to storage for prototype" ON storage.objects;

CREATE POLICY "Give full access to storage for prototype" 
ON storage.objects FOR ALL 
USING (bucket_id = 'berkas_cuti') 
WITH CHECK (bucket_id = 'berkas_cuti');

-- Catatan Keamanan Produksi: Di production, disarankan untuk mengintegrasikan Supabase Auth sepenuhnya, 
-- dan mengubah klausa (true) menjadi batasan peran seperti `auth.role() = 'authenticated'`

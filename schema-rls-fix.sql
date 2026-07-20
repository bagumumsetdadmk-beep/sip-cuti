-- schema-rls-fix.sql
-- Silakan jalankan query SQL ini di Supabase SQL Editor Anda untuk menonaktifkan RLS
-- agar prototype dapat berjalan lancar tanpa kendala akses data.

-- Menghapus RLS atau memberikan akses penuh ke seluruh tabel:
ALTER TABLE pegawai DISABLE ROW LEVEL SECURITY;
ALTER TABLE sisa_cuti_tahunan DISABLE ROW LEVEL SECURITY;
ALTER TABLE pengajuan_cuti DISABLE ROW LEVEL SECURITY;
ALTER TABLE atasan_pejabat DISABLE ROW LEVEL SECURITY;
ALTER TABLE hari_libur DISABLE ROW LEVEL SECURITY;
ALTER TABLE jenis_cuti DISABLE ROW LEVEL SECURITY;
ALTER TABLE pengaturan_instansi DISABLE ROW LEVEL SECURITY;
ALTER TABLE users_role DISABLE ROW LEVEL SECURITY;

-- Atau jika tetap ingin RLS aktif, jalankan baris di bawah ini untuk membuat policy universal:
-- DROP POLICY IF EXISTS "Enable ALL access for all" ON pegawai;
-- CREATE POLICY "Enable ALL access for all" ON pegawai FOR ALL USING (true) WITH CHECK (true);

-- DROP POLICY IF EXISTS "Enable ALL access for all" ON sisa_cuti_tahunan;
-- CREATE POLICY "Enable ALL access for all" ON sisa_cuti_tahunan FOR ALL USING (true) WITH CHECK (true);

-- DROP POLICY IF EXISTS "Enable ALL access for all" ON pengajuan_cuti;
-- CREATE POLICY "Enable ALL access for all" ON pengajuan_cuti FOR ALL USING (true) WITH CHECK (true);

-- DROP POLICY IF EXISTS "Enable ALL access for all" ON atasan_pejabat;
-- CREATE POLICY "Enable ALL access for all" ON atasan_pejabat FOR ALL USING (true) WITH CHECK (true);

-- DROP POLICY IF EXISTS "Enable ALL access for all" ON hari_libur;
-- CREATE POLICY "Enable ALL access for all" ON hari_libur FOR ALL USING (true) WITH CHECK (true);

-- DROP POLICY IF EXISTS "Enable ALL access for all" ON jenis_cuti;
-- CREATE POLICY "Enable ALL access for all" ON jenis_cuti FOR ALL USING (true) WITH CHECK (true);

-- DROP POLICY IF EXISTS "Enable ALL access for all" ON pengaturan_instansi;
-- CREATE POLICY "Enable ALL access for all" ON pengaturan_instansi FOR ALL USING (true) WITH CHECK (true);

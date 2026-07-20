-- schema-storage-fix.sql
-- Jalankan query SQL ini di Supabase SQL Editor Anda untuk memberikan akses penuh pada Storage (Bucket: berkas_cuti)

DROP POLICY IF EXISTS "Enable public access to read berkas" ON storage.objects;
DROP POLICY IF EXISTS "Enable authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Enable ALL uploads" ON storage.objects;

-- Berikan akses penuh (ALL) untuk bucket berkas_cuti di tahap prototype
CREATE POLICY "Give full access to storage for prototype" 
ON storage.objects FOR ALL 
USING (bucket_id = 'berkas_cuti') 
WITH CHECK (bucket_id = 'berkas_cuti');

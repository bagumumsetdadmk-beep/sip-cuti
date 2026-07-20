# Si-Cuti Setda Kabupaten Demak

Sistem Informasi Pengajuan Cuti ASN untuk Sekretariat Daerah Kabupaten Demak. Dibangun dengan Next.js, Tailwind CSS, shadcn/ui, dan Supabase.

## Persiapan Deployment (Vercel & Supabase)

### 1. Supabase Database & Storage
1. Buka [Supabase Dashboard](https://supabase.com/dashboard).
2. Buat project baru.
3. Buka menu **SQL Editor**, jalankan script yang ada di dalam `app/applet/schema.sql` untuk membuat tabel, pengaturan Row Level Security (RLS), dan Storage Bucket (`berkas_cuti`).

### 2. Konfigurasi Environment Variables
Di Vercel, pastikan Anda menambahkan Environment Variables berikut sesuai dengan nilai di project Supabase Anda (Settings > API):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

*(Catatan: Variabel di atas bersifat publik/anon, aman digunakan di client-side).*

### 3. Deployment ke Vercel
1. Upload/Push repository ini ke GitHub.
2. Login ke [Vercel](https://vercel.com).
3. Pilih **Add New > Project**, lalu import repository GitHub Anda.
4. Pada bagian **Environment Variables**, masukkan variabel dari langkah 2.
5. Klik **Deploy**.

## Menjalankan secara Lokal
1. Buat file `.env.local` dan isi dengan konfigurasi dari `.env.example`.
2. Jalankan `npm install` (atau `bun install`).
3. Jalankan `npm run dev`.

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const targetId = id ? decodeURIComponent(id).trim() : '';

    if (!targetId) {
      return NextResponse.json(
        { success: false, message: 'ID pengajuan cuti tidak valid.' },
        { status: 400 }
      );
    }

    // 1. Query pengajuan_cuti dari Supabase berdasarkan ID atau nomor_surat
    const { data: pengajuan, error: pErr } = await supabase
      .from('pengajuan_cuti')
      .select('*')
      .or(`id.eq.${targetId},nomor_surat.eq.${targetId}`)
      .maybeSingle();

    if (pErr) {
      console.error('Error querying pengajuan_cuti:', pErr);
    }

    if (!pengajuan) {
      return NextResponse.json(
        { success: false, message: 'Dokumen cuti tidak ditemukan atau tidak valid.' },
        { status: 404 }
      );
    }

    // 2. Fetch data Pegawai pemohon
    let pegawai = null;
    if (pengajuan.pegawai_id) {
      const { data: pData } = await supabase
        .from('pegawai')
        .select('*')
        .eq('id', pengajuan.pegawai_id)
        .maybeSingle();
      pegawai = pData;
    }

    // 3. Fetch data Jenis Cuti
    let jenisCuti = null;
    if (pengajuan.jenis_cuti_id) {
      const { data: jcData } = await supabase
        .from('jenis_cuti')
        .select('*')
        .eq('id', pengajuan.jenis_cuti_id)
        .maybeSingle();
      jenisCuti = jcData;
    }

    // 4. Response JSON terstruktur
    return NextResponse.json({
      success: true,
      data: {
        id: pengajuan.id,
        nomorSurat: pengajuan.nomor_surat || '-',
        tanggalPengajuan: pengajuan.tanggal_pengajuan,
        tanggalMulai: pengajuan.tanggal_mulai,
        tanggalSelesai: pengajuan.tanggal_selesai,
        jumlahHari: pengajuan.jumlah_hari,
        alasan: pengajuan.alasan || '-',
        alamatSelamaCuti: pengajuan.alamat_selama_cuti || '-',
        noTelpHubungi: pengajuan.no_telp_hubungi || '-',
        status: pengajuan.status || 'Disetujui',
        metodePenandatanganan: pengajuan.metode_penandatanganan || 'TTE',
        pegawai: pegawai ? {
          id: pegawai.id,
          nama: pegawai.nama,
          nip: pegawai.nip,
          jabatan: pegawai.jabatan,
          statusPegawai: pegawai.status_pegawai,
          unitKerja: pegawai.unit_kerja,
          golongan: pegawai.golongan,
          noHp: pegawai.no_hp
        } : null,
        jenisCuti: jenisCuti ? {
          id: jenisCuti.id,
          nama: jenisCuti.nama,
          kuotaDefault: jenisCuti.kuota_default
        } : null
      }
    });

  } catch (error: any) {
    console.error('Server error on verifikasi API:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan internal server.' },
      { status: 500 }
    );
  }
}

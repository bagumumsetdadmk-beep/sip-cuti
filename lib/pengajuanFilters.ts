import { PengajuanCuti } from './types';

export interface UserContext {
  role: 'Admin' | 'Operator' | 'Verifikator' | 'Atasan' | 'Pejabat' | 'Pegawai' | string;
  pegawaiId?: string | null;
  id?: string | null;
}

/**
 * LOGIKA FILTER DATA PENGAJUAN CUTI & PERSETUJUAN CUTI BERDASARKAN ROLE USER
 * 
 * Business Rules (Aturan Bisnis Kepegawaian):
 * 1. Role ADMIN:
 *    - Menampilkan SELURUH data pengajuan cuti tanpa filter (semua status pengajuan tetap muncul di tabel pengajuan & persetujuan).
 * 2. Role OPERATOR:
 *    - Pada Tabel Pengajuan Cuti: HANYA tampilkan data yang aktif/proses (status BUKAN 'Disetujui').
 *    - Ketika status berubah menjadi 'Disetujui', data OTOMATIS DIFILTER KELUAR dari tabel pengajuan utama, dan HANYA muncul pada Tabel Cetak Pengajuan.
 * 3. Role VERIFIKATOR:
 *    - Pada Tabel Persetujuan: Menampilkan pengajuan yang membutuhkan verifikasi (status 'Menunggu', 'Sudah Diperbaiki', 'Dalam Perbaikan', 'PROSES_VERIFIKATOR').
 *    - Setelah Verifikator menyetujui, data tersebut TIDAK LAGI MUNCUL di daftar persetujuan Verifikator.
 * 4. Role ATASAN LANGSUNG:
 *    - Pada Tabel Persetujuan: HANYA menampilkan pengajuan yang ditujukan kepada Atasan tersebut (atasan_id sama dengan user) DAN statusnya 'Menunggu Atasan' / 'PROSES_ATASAN'.
 *    - Setelah Atasan menyetujui/menolak, data otomatis hilang dari daftar persetujuan Atasan.
 * 5. Role PEJABAT PENANGGUNG JAWAB:
 *    - Pada Tabel Persetujuan: HANYA menampilkan pengajuan yang ditujukan kepada Pejabat tersebut (pejabat_id sama dengan user) DAN statusnya 'Menunggu Pejabat' / 'PROSES_PEJABAT'.
 *    - Setelah Pejabat menyetujui/menolak, data otomatis hilang dari daftar keputusan Pejabat.
 */
export function filterPengajuanByRole(
  pengajuanList: PengajuanCuti[],
  user: UserContext | null | undefined,
  isApprovalPage: boolean
): PengajuanCuti[] {
  if (!user) return pengajuanList;

  const role = user.role;
  const userPegawaiId = user.pegawaiId;

  // Helper untuk pencocokan ID atasan & pejabat
  const isMatchedAtasan = (pj: PengajuanCuti) => {
    if (!userPegawaiId) return true;
    return pj.atasanId === userPegawaiId || pj.atasanId === user.id;
  };

  const isMatchedPejabat = (pj: PengajuanCuti) => {
    if (!userPegawaiId) return true;
    return pj.pejabatId === userPegawaiId || pj.pejabatId === user.id;
  };

  // Status checkers (fleksibel untuk format camelCase & UPPERCASE)
  const isApprovedStatus = (status: string) => {
    const s = (status || '').toUpperCase();
    return s === 'DISETUJUI';
  };

  const isWaitingVerifikatorStatus = (status: string) => {
    const s = (status || '').toUpperCase();
    return s === 'MENUNGGU' || s === 'SUDAH DIPERBAIKI' || s === 'DALAM PERBAIKAN' || s === 'PROSES_VERIFIKATOR' || s === 'PERBAIKAN';
  };

  const isWaitingAtasanStatus = (status: string) => {
    const s = (status || '').toUpperCase();
    return s === 'MENUNGGU ATASAN' || s === 'PROSES_ATASAN' || s === 'DISETUJUI VERIFIKATOR';
  };

  const isWaitingPejabatStatus = (status: string) => {
    const s = (status || '').toUpperCase();
    return s === 'MENUNGGU PEJABAT' || s === 'PROSES_PEJABAT' || s === 'DISETUJUI ATASAN';
  };

  // --- 1. HALAMAN PERSETUJUAN CUTI (isApprovalPage === true) ---
  if (isApprovalPage) {
    // 1. Role ADMIN: Menampilkan SELURUH data pengajuan cuti tanpa filter
    if (role === 'Admin') {
      return pengajuanList;
    }

    // 2. Role VERIFIKATOR: HANYA pengajuan yang membutuhkan verifikasi verifikator
    if (role === 'Verifikator') {
      return pengajuanList.filter(pj => isWaitingVerifikatorStatus(pj.status));
    }

    // 3. Role ATASAN LANGSUNG: HANYA pengajuan yang ditujukan kepada Atasan tersebut DAN statusnya 'Menunggu Atasan'
    if (role === 'Atasan') {
      return pengajuanList.filter(pj => isMatchedAtasan(pj) && isWaitingAtasanStatus(pj.status));
    }

    // 4. Role PEJABAT PENANGGUNG JAWAB: HANYA pengajuan yang ditujukan kepada Pejabat tersebut DAN statusnya 'Menunggu Pejabat'
    if (role === 'Pejabat') {
      return pengajuanList.filter(pj => isMatchedPejabat(pj) && isWaitingPejabatStatus(pj.status));
    }

    // 5. Role OPERATOR pada halaman persetujuan: tampilkan pengajuan yang belum selesai disetujui
    if (role === 'Operator') {
      return pengajuanList.filter(pj => !isApprovedStatus(pj.status));
    }

    if (userPegawaiId) {
      return pengajuanList.filter(pj => 
        (isMatchedAtasan(pj) && isWaitingAtasanStatus(pj.status)) || 
        (isMatchedPejabat(pj) && isWaitingPejabatStatus(pj.status))
      );
    }

    return pengajuanList;
  }

  // --- 2. HALAMAN PENGAJUAN CUTI UTAMA (isApprovalPage === false) ---
  else {
    // 1. Role ADMIN: Menampilkan SELURUH data pengajuan cuti tanpa filter
    if (role === 'Admin') {
      return pengajuanList;
    }

    // 2. Role OPERATOR, VERIFIKATOR, ATASAN, PEJABAT, PEGAWAI pada Tabel Pengajuan Cuti:
    // HANYA tampilkan data yang aktif/proses (status BUKAN 'Disetujui').
    // Ketika status berubah menjadi 'Disetujui', data OTOMATIS DISAMBUNGKAN/DIFILTER KELUAR
    // dari tabel pengajuan utama, dan HANYA muncul pada Tabel Cetak Pengajuan.
    if (role === 'Operator' || role === 'Verifikator') {
      return pengajuanList.filter(pj => !isApprovedStatus(pj.status));
    }

    if (role === 'Atasan') {
      return pengajuanList.filter(pj => isMatchedAtasan(pj) && !isApprovedStatus(pj.status));
    }

    if (role === 'Pejabat') {
      return pengajuanList.filter(pj => isMatchedPejabat(pj) && !isApprovedStatus(pj.status));
    }

    if (userPegawaiId) {
      return pengajuanList.filter(pj => 
        (pj.pegawaiId === userPegawaiId || isMatchedAtasan(pj) || isMatchedPejabat(pj)) && 
        !isApprovedStatus(pj.status)
      );
    }

    return pengajuanList.filter(pj => !isApprovedStatus(pj.status));
  }
}

/**
 * CONTOH QUERY SUPABASE / POSTGRESQL UNTUK SERVER-SIDE DATABASE FILTERING
 * Menggunakan kriteria status & ID sesuai role user.
 */
export function buildSupabaseQuery(
  supabaseClient: any,
  user: UserContext,
  isApprovalPage: boolean
) {
  let query = supabaseClient.from('pengajuan_cuti').select('*, pegawai(*), jenis_cuti(*)');

  // Role Admin: tanpa filter
  if (user.role === 'Admin') {
    return query;
  }

  if (isApprovalPage) {
    if (user.role === 'Verifikator') {
      return query.in('status', ['Menunggu', 'Sudah Diperbaiki', 'Dalam Perbaikan', 'PROSES_VERIFIKATOR', 'PERBAIKAN']);
    }
    if (user.role === 'Atasan' && user.pegawaiId) {
      return query
        .eq('atasan_id', user.pegawaiId)
        .in('status', ['Menunggu Atasan', 'PROSES_ATASAN', 'DISETUJUI VERIFIKATOR']);
    }
    if (user.role === 'Pejabat' && user.pegawaiId) {
      return query
        .eq('pejabat_id', user.pegawaiId)
        .in('status', ['Menunggu Pejabat', 'PROSES_PEJABAT', 'DISETUJUI ATASAN']);
    }
    if (user.role === 'Operator') {
      return query.neq('status', 'Disetujui');
    }
  } else {
    // Tabel Pengajuan Cuti Utama: Sembunyikan yang sudah 'Disetujui' (diakses di Tabel Cetak)
    if (user.role === 'Operator' || user.role === 'Verifikator') {
      return query.neq('status', 'Disetujui');
    }
    if (user.role === 'Atasan' && user.pegawaiId) {
      return query.eq('atasan_id', user.pegawaiId).neq('status', 'Disetujui');
    }
    if (user.role === 'Pejabat' && user.pegawaiId) {
      return query.eq('pejabat_id', user.pegawaiId).neq('status', 'Disetujui');
    }
    if (user.pegawaiId) {
      return query.eq('pegawai_id', user.pegawaiId).neq('status', 'Disetujui');
    }
  }

  return query;
}

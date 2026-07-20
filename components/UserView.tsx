'use client';

import React, { useState } from 'react';
import { Search, UserPlus, Edit2, Trash2, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PengaturanUser, Pegawai } from '../lib/types';
import { useToast } from '../lib/ToastContext';
import Pagination from './Pagination';
import SearchableSelect from './SearchableSelect';

interface UserViewProps {
  users: PengaturanUser[];
  pegawai: Pegawai[];
  addUser: (u: Omit<PengaturanUser, 'id'>) => void;
  updateUser: (id: string, u: Partial<PengaturanUser>) => void;
  deleteUser: (id: string) => void;
}

export default function UserView({ users, pegawai, addUser, updateUser, deleteUser }: UserViewProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PengaturanUser | null>(null);

  // Form States
  const [username, setUsername] = useState('');
  const [nama, setNama] = useState('');
  const [role, setRole] = useState<'Admin' | 'Operator' | 'Verifikator'>('Operator');
  const [password, setPassword] = useState('');
  const [pegawaiId, setPegawaiId] = useState('');

  const filteredUsersBase = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsersBase.length / itemsPerPage);
  const filteredUsers = filteredUsersBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPegawaiNama = (id?: string) => {
    if (!id) return '-';
    return pegawai.find(p => p.id === id)?.nama || '-';
  };

  const openAddModal = () => {
    setSelectedUser(null);
    setUsername('');
    setNama('');
    setRole('Operator');
    setPassword('');
    setPegawaiId('');
    setShowModal(true);
  };

  const openEditModal = (u: PengaturanUser) => {
    setSelectedUser(u);
    setUsername(u.username);
    setNama(u.nama);
    setRole(u.role);
    setPassword(u.password);
    setPegawaiId(u.pegawaiId || '');
    setShowModal(true);
  };

  const openDeleteConfirm = (u: PengaturanUser) => {
    setSelectedUser(u);
    setShowDeleteConfirm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !nama || !password) {
      showToast('Harap isi semua kolom wajib!', 'error');
      return;
    }

    // Cek duplikasi username
    if (!selectedUser) {
      const duplicate = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (duplicate) {
        showToast('Username sudah terpakai! Gunakan nama username yang lain.', 'error');
        return;
      }
    }

    if (selectedUser) {
      updateUser(selectedUser.id, {
        username,
        nama,
        role,
        password,
        pegawaiId: pegawaiId || undefined
      });
      showToast('Akun pengguna berhasil diperbarui.', 'success');
    } else {
      addUser({
        username,
        nama,
        role,
        password,
        pegawaiId: pegawaiId || undefined
      });
      showToast('Akun pengguna baru berhasil ditambahkan.', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (selectedUser) {
      // Admin utama tidak boleh didelete untuk keamanan
      if (selectedUser.username === 'admin') {
        showToast('Akun admin utama sistem tidak boleh dihapus!', 'error');
        setShowDeleteConfirm(false);
        return;
      }
      deleteUser(selectedUser.id);
      showToast('Akun pengguna berhasil dihapus.', 'info');
      setShowDeleteConfirm(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">Manajemen Pengguna Aplikasi</h3>
          <p className="text-xs text-gray-500">Kelola akun kredensial akses login untuk administrator dinas, operator pemohon, dan pejabat verifikator.</p>
        </div>
        <button
          id="btn-tambah-user"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun User</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari username, nama atau role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        <span className="text-xs text-gray-400 font-mono">Jumlah Akun Terdaftar: <strong className="text-gray-850">{users.length}</strong></span>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                <th className="p-4">No</th>
                <th className="p-4">Username Login</th>
                <th className="p-4">Nama Lengkap Akun</th>
                <th className="p-4">Role Akses</th>
                <th className="p-4">Terhubung Pegawai</th>
                <th className="p-4">Password Text</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredUsersBase.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    Data pengguna tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="p-4 font-mono text-gray-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="p-4">
                      <div className="font-bold text-blue-950 font-mono">@{u.username}</div>
                    </td>
                    <td className="p-4 font-semibold text-gray-800">{u.nama}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                        u.role === 'Admin'
                          ? 'bg-rose-50 text-rose-800 border border-rose-100'
                          : u.role === 'Verifikator'
                          ? 'bg-amber-50 text-amber-800 border border-amber-100'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{getPegawaiNama(u.pegawaiId)}</td>
                    <td className="p-4 font-mono text-gray-400">{u.password}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          id={`btn-edit-user-${u.id}`}
                          onClick={() => openEditModal(u)}
                          className="p-1.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 rounded transition-all cursor-pointer"
                          title="Ubah Password/Akses"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-delete-user-${u.id}`}
                          disabled={u.username === 'admin'}
                          onClick={() => openDeleteConfirm(u)}
                          className={`p-1.5 rounded border transition-all ${
                            u.username === 'admin'
                              ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                              : 'bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-700 border-gray-200 cursor-pointer'
                          }`}
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredUsersBase.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* MODAL ADD / EDIT */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-850">
                {selectedUser ? 'Ubah Akun Pengguna' : 'Tambah Akun Pengguna'}
              </h4>
              <button 
                id="close-modal-user"
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Username Login *</label>
                <input
                  type="text"
                  required
                  disabled={!!selectedUser} // Username tidak boleh diganti setelah dibuat
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                  placeholder="Contoh: agus_operator"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Nama Lengkap Tampilan *</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Sri Wahyuni, S.E. (Operator)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Password Sandi *</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password login..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Role Hak Akses *</label>
                  <select
                    value={role}
                    disabled={selectedUser?.username === 'admin'} // Admin utama tidak boleh diganti rolenya
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    <option value="Admin">Admin Setda</option>
                    <option value="Operator">Operator</option>
                    <option value="Verifikator">Verifikator</option>
                  </select>
                </div>

                <div className="col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Hubungkan Pegawai</label>
                  <SearchableSelect
                    value={pegawaiId}
                    onChange={(val) => setPegawaiId(val)}
                    placeholder="-- Tidak Terhubung --"
                    options={[
                      { value: '', label: '-- Tidak Terhubung --' },
                      ...pegawai.map(p => ({
                        value: p.id,
                        label: p.nama
                      }))
                    ]}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  id="btn-batal-user-form"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-simpan-user-form"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100 mx-auto">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-900">Konfirmasi Hapus Akun</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus akun user <strong className="text-gray-800">@{selectedUser?.username}</strong>? Kredensial login ini tidak akan bisa digunakan lagi.
                </p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                id="btn-batal-delete-user"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-ya-delete-user"
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

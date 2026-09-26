import { supabase } from './supabase';
import { getStorageFilePath } from './utils';

export interface UploadResult {
  url: string;
  fileName: string;
}

/**
 * Resilient upload function that never crashes with "Failed to fetch".
 * 1. Attempts local server-side upload via Next.js `/api/upload`.
 * 2. If server API is unreachable or fails, falls back cleanly to client-side Data URL (Base64).
 */
export async function uploadFile(
  file: File,
  prefix: 'logo' | 'berkas' | 'file' = 'file'
): Promise<UploadResult> {
  if (!file) {
    throw new Error('Tidak ada berkas yang dipilih.');
  }

  // 1. Try local server-side upload endpoint
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prefix', prefix);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return {
          url: data.url,
          fileName: data.fileName || file.name,
        };
      }
    }
  } catch (apiErr) {
    console.warn('Upload via /api/upload failed, using Data URL fallback:', apiErr);
  }

  // 2. Fallback to FileReader Base64 Data URL (immune to network/DNS failures)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve({
          url: reader.result,
          fileName: file.name,
        });
      } else {
        reject(new Error('Format berkas tidak dapat diproses.'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Gagal membaca berkas secara lokal.'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Safely removes an uploaded file from local server or Supabase storage without throwing.
 */
export async function deleteUploadedFile(url?: string | null): Promise<void> {
  if (!url || url.startsWith('data:')) return;

  const storagePath = getStorageFilePath(url);
  if (!storagePath) return;

  // 1. If stored on local server (/api/files/)
  if (url.includes('/api/files/')) {
    try {
      await fetch(`/api/files/${encodeURIComponent(storagePath)}`, {
        method: 'DELETE',
      });
      return;
    } catch (err) {
      console.warn('Gagal menghapus berkas via API lokal:', err);
    }
  }

  // 2. If stored in Supabase Storage
  try {
    await supabase.storage.from('berkas_cuti').remove([storagePath]);
  } catch (err) {
    console.warn('Gagal menghapus berkas dari Supabase:', err);
  }
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStorageFilePath(url?: string | null, bucketName = 'berkas_cuti'): string | null {
  if (!url) return null;
  
  if (url.startsWith('data:')) return null;

  if (url.includes('/api/files/')) {
    const parts = url.split('/api/files/');
    return decodeURIComponent(parts[parts.length - 1].split('?')[0]);
  }

  if (url.includes('/uploads/')) {
    const parts = url.split('/uploads/');
    return decodeURIComponent(parts[parts.length - 1].split('?')[0]);
  }

  const bucketSearch = `/${bucketName}/`;
  if (url.includes(bucketSearch)) {
    const parts = url.split(bucketSearch);
    const relativePath = parts[parts.length - 1].split('?')[0];
    return decodeURIComponent(relativePath);
  }
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url;
  }
  
  return null;
}

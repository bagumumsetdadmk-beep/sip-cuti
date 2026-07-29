import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStorageFilePath(url?: string | null, bucketName = 'berkas_cuti'): string | null {
  if (!url) return null;
  
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

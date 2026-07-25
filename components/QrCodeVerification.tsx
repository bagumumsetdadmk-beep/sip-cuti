'use client';

import React from 'react';

interface QrCodeVerificationProps {
  idPengajuan: string;
  size?: number;
  className?: string;
  baseUrl?: string;
}

/**
 * Komponen Generator QR Code Verifikasi Dokumen Cuti
 * Memuat URL singkat berbasis ID unik pengajuan (misal: https://sip-cuti.vercel.app/verifikasi/pc-1)
 * Menggunakan Error Correction Level 'L' agar pola QR Code renggang dan sangat mudah di-scan.
 */
export default function QrCodeVerification({
  idPengajuan,
  size = 300,
  className = "w-28 h-28 sm:w-36 sm:h-36 object-contain shrink-0",
  baseUrl
}: QrCodeVerificationProps) {
  const origin = baseUrl || (typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://sip-cuti.vercel.app');
  const verificationUrl = `${origin}/verifikasi/${encodeURIComponent(idPengajuan)}`;
  
  // URL QR Server dengan Error Correction Level 'L' & Margin '1' untuk kepadatannya yang renggang
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&ecc=L&margin=1&data=${encodeURIComponent(verificationUrl)}`;

  return (
    <img
      src={qrCodeUrl}
      alt={`QR Code Verifikasi Dokumen ${idPengajuan}`}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
}

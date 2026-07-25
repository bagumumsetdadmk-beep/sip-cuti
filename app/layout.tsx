import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { ToastProvider } from '../lib/ToastContext';

export const metadata: Metadata = {
  title: 'SIP-CUTI SETDA KABUPATEN DEMAK',
  description: 'Sistem Informasi Pengajuan Cuti ASN Setda Kabupaten Demak',
  icons: {
    icon: '/assets/logo-demak.png',
    shortcut: '/assets/logo-demak.png',
    apple: '/assets/logo-demak.png',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

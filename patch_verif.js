const fs = require('fs');
let code = fs.readFileSync('app/verifikasi/page.tsx', 'utf-8');

// Add sisaCutiList state
code = code.replace(
  'const [instansiData] = useState<PengaturanInstansi>',
  `const [sisaCutiList] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sip_cuti_sisa_cuti');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored sisa cuti:', e);
      }
    }
    return [];
  });

  const [instansiData] = useState<PengaturanInstansi>`
);

// Import CetakCutiView
code = code.replace(
  'import { PengajuanCuti, Pegawai, JenisCuti, PengaturanInstansi } from \'../../lib/types\';',
  `import { PengajuanCuti, Pegawai, JenisCuti, PengaturanInstansi } from '../../lib/types';\nimport CetakCutiView from '../../components/CetakCutiView';`
);

// We need to change the block starting from `activePengajuan ? (`
// Note we have to handle the button "Buka Aplikasi Utama" and "Tutup Dokumen".
// Wait, `CetakCutiView`'s verifikasi mode renders the "Tutup Dokumen" button inside the modal toolbar.
// We can just pass `onTutupVerifikasi={() => { window.location.href = '/'; }}`

const replacementBlock = `activePengajuan ? (
          <div className="w-full max-w-4xl mx-auto">
             <CetakCutiView 
                pengajuan={pengajuanList}
                pegawai={pegawaiList}
                jenisCuti={jenisCutiList}
                sisaCuti={sisaCutiList}
                instansi={instansiData}
                mode="verifikasi"
                verifikasiPengajuanId={activePengajuan.id}
                onTutupVerifikasi={() => { window.location.href = '/'; }}
             />
          </div>
        ) : searched ? (`;

// We need to replace the old activePengajuan rendering block
// It starts from `activePengajuan ? (` and ends before `) : searched ? (`

const startIndex = code.indexOf('activePengajuan ? (');
const endIndex = code.indexOf(') : searched ? (');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + replacementBlock + code.substring(endIndex + 16);
  fs.writeFileSync('app/verifikasi/page.tsx', code);
  console.log("Patched verifikasi page!");
} else {
  console.log("Could not find blocks");
}


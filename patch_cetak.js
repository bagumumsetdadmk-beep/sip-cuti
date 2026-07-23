const fs = require('fs');
let code = fs.readFileSync('components/CetakCutiView.tsx', 'utf-8');

code = code.replace(
  'interface CetakCutiViewProps {\n  pengajuan: PengajuanCuti[];\n  pegawai: Pegawai[];\n  jenisCuti: JenisCuti[];\n  sisaCuti: SisaCutiTahunan[];\n  instansi: PengaturanInstansi;\n  currentUser?: { role: string; pegawaiId?: string; } | null;\n}',
  `interface CetakCutiViewProps {
  pengajuan: PengajuanCuti[];
  pegawai: Pegawai[];
  jenisCuti: JenisCuti[];
  sisaCuti: SisaCutiTahunan[];
  instansi: PengaturanInstansi;
  currentUser?: { role: string; pegawaiId?: string; } | null;
  mode?: 'normal' | 'verifikasi';
  verifikasiPengajuanId?: string;
  onTutupVerifikasi?: () => void;
}`
);

code = code.replace(
  'export default function CetakCutiView({ pengajuan, pegawai, jenisCuti, sisaCuti, instansi, currentUser }: CetakCutiViewProps) {\n  const [searchTerm, setSearchTerm] = useState(\'\');\n  const [selectedPrint, setSelectedPrint] = useState<PengajuanCuti | null>(null);',
  `export default function CetakCutiView({ pengajuan, pegawai, jenisCuti, sisaCuti, instansi, currentUser, mode = 'normal', verifikasiPengajuanId, onTutupVerifikasi }: CetakCutiViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const verifikasiTarget = mode === 'verifikasi' && verifikasiPengajuanId 
    ? pengajuan.find(p => p.id === verifikasiPengajuanId || p.nomorSurat === verifikasiPengajuanId) || null 
    : null;

  const [selectedPrintState, setSelectedPrintState] = useState<PengajuanCuti | null>(null);

  const selectedPrint = mode === 'verifikasi' ? verifikasiTarget : selectedPrintState;
  const setSelectedPrint = mode === 'verifikasi' ? () => {} : setSelectedPrintState;`
);

// We need to conditionally hide the list if mode === 'verifikasi'
code = code.replace(
  '{/* List Cetak (no-print) */}\n      <div className={`space-y-6 ${selectedPrint ? \'no-print hidden md:block\' : \'\'}`}>',
  `{/* List Cetak (no-print) */}
      {mode !== 'verifikasi' && (
      <div className={\`space-y-6 \${selectedPrint ? 'no-print hidden md:block' : ''}\`}>`
);

// Close the wrapper
code = code.replace(
  '        </div>\n      </div>\n\n      {/* MODAL PRINT PREVIEW RESMI BKN (Aktif saat selectedPrint terisi) */}',
  `        </div>
      </div>
      )}

      {/* MODAL PRINT PREVIEW RESMI BKN (Aktif saat selectedPrint terisi) */}`
);

// We need to change the close button behavior
code = code.replace(
  'onClick={() => setSelectedPrint(null)}',
  'onClick={() => mode === \'verifikasi\' && onTutupVerifikasi ? onTutupVerifikasi() : setSelectedPrint(null)}'
);
// Make the container not fixed inset-0 if mode is verifikasi
code = code.replace(
  'return (\n          <div className="fixed inset-0 bg-gray-100 md:bg-black/50 overflow-y-auto z-50 flex items-start justify-center p-0 md:p-6 transition-all">\n            <div className="bg-white w-full max-w-[850px] shadow-2xl border-0 md:border border-gray-300 md:rounded-xl overflow-hidden flex flex-col my-0 md:my-4 print:my-0">',
  `return (
          <div className={mode === 'verifikasi' ? "flex items-start justify-center p-0 w-full" : "fixed inset-0 bg-gray-100 md:bg-black/50 overflow-y-auto z-50 flex items-start justify-center p-0 md:p-6 transition-all"}>
            <div className={\`bg-white w-full max-w-[850px] overflow-hidden flex flex-col \${mode === 'verifikasi' ? 'shadow-sm border border-slate-200 rounded-2xl print:border-none print:shadow-none' : 'shadow-2xl border-0 md:border border-gray-300 md:rounded-xl my-0 md:my-4 print:my-0'}\`}>`
);


// Change X icon to "Tutup Dokumen" if mode === verifikasi
code = code.replace(
  '<X className="w-4 h-4" />\n                    </button>',
  `{mode === 'verifikasi' ? <span className="font-bold text-xs px-2">Tutup Dokumen</span> : <X className="w-4 h-4" />}
                    </button>`
);

fs.writeFileSync('components/CetakCutiView.tsx', code);
console.log("Patched CetakCutiView.tsx");

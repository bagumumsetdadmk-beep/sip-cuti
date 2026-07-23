const fs = require('fs');
let code = fs.readFileSync('components/CetakCutiView.tsx', 'utf-8');

code = code.replace(
  'referrerPolicy="no-referrer"\n                        />\n                      </div>\n                      <div className="col-span-6 flex flex-row">',
  `referrerPolicy="no-referrer"
                        />
                        <div className="text-[8px] leading-tight text-gray-800">
                          <p className="font-bold uppercase tracking-tight">VERIFIKASI DOKUMEN CUTI</p>
                          <p className="text-[7px] text-gray-600 mt-0.5">Pindai QR Code ini untuk menampilkan formulir cuti digital resmi & status TTE.</p>
                          <p className="font-mono text-[7px] text-emerald-800 font-bold mt-1">ID: {selectedPrint.id}</p>
                        </div>
                      </div>
                      <div className="col-span-6 flex flex-row">`
);

fs.writeFileSync('components/CetakCutiView.tsx', code);
console.log("Patched text back");

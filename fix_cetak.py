import re

with open('components/CetakCutiView.tsx', 'r') as f:
    content = f.read()

# Font size changes
content = content.replace('text-[10px]', 'text-xs')
content = content.replace('text-[11px]', 'text-sm')
content = content.replace('text-[13px]', 'text-base')
content = content.replace('text-[9px]', 'text-[11px]')
content = content.replace('text-[8px]', 'text-[10px]')

# Kepada Yth
content = content.replace('<p>Yth. {instansi.jabatanKepala}</p>', '<p>Yth. {getPegawaiDetail(selectedPrint.pejabatId)?.jabatan || instansi.jabatanKepala}</p>')

# Romawi terpisah
# We replace `<div className="border-[0.5px] border-black font-sans text-xs">` 
# with `<div className="font-sans text-xs flex flex-col gap-2">` and then we change the `border-b-[0.5px]` inside to full borders.
content = content.replace('<div className="border-[0.5px] border-black font-sans text-xs">', '<div className="font-sans text-xs flex flex-col gap-3">')
content = content.replace('<div className="border-b-[0.5px] border-black bg-white">', '<div className="border-[1px] border-black bg-white">')
content = content.replace('<div className="border-b-[0.5px] border-black">', '<div className="border-[1px] border-black bg-white">')
# except the last one, VIII, which doesn't have border-b originally, but we can fix that later.
content = content.replace('                  <div>\n                    <div className="p-1 font-bold border-b-[0.5px]', '                  <div className="border-[1px] border-black bg-white">\n                    <div className="p-1 font-bold border-b-[0.5px]')

# Fix VI. Alamat
vi_old = """                  {/* VI. ALAMAT SELAMA MENJALANKAN CUTI */}
                  <div className="border-[1px] border-black bg-white">
                    <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">VI. ALAMAT SELAMA MENJALANKAN CUTI</div>
                    <div className="grid grid-cols-12">
                      <div className="col-span-5 p-2 min-h-[60px] border-r-[0.5px] border-black italic leading-tight">
                        {selectedPrint.alamatSelamaCuti}
                      </div>
                      <div className="col-span-2 p-1 border-r-[0.5px] border-black">
                        <p className="font-bold text-center border-b-[0.5px] border-black mb-1">TELP</p>
                        <p className="text-center italic">{selectedPrint.noTelpHubungi}</p>
                      </div>
                      <div className="col-span-5 p-2 flex flex-col items-center justify-center">
                        <p className="mb-8">Hormat Saya,</p>
                        <p className="font-bold underline text-center">({pDetail?.nama})</p>
                        <p className="text-center uppercase">{isPNS ? \'NIP\' : \'NI PPPK\'}. {pDetail?.nip}</p>
                      </div>
                    </div>
                  </div>"""

vi_new = """                  {/* VI. ALAMAT SELAMA MENJALANKAN CUTI */}
                  <div className="border-[1px] border-black bg-white">
                    <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">VI. ALAMAT SELAMA MENJALANKAN CUTI</div>
                    <div className="grid grid-cols-12 border-b-[0.5px] border-black">
                      <div className="col-span-6 p-2 min-h-[40px] border-r-[0.5px] border-black italic leading-tight">
                        {selectedPrint.alamatSelamaCuti}
                      </div>
                      <div className="col-span-2 p-2 border-r-[0.5px] border-black flex items-center justify-center">
                        <p className="font-bold text-center">TELP</p>
                      </div>
                      <div className="col-span-4 p-2 flex items-center justify-center">
                        <p className="text-center italic">{selectedPrint.noTelpHubungi}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-12 min-h-[100px]">
                      <div className="col-span-6 border-r-[0.5px] border-black"></div>
                      <div className="col-span-6 flex flex-row">
                        <div className="w-1/3 flex items-center justify-center p-2">
                           {selectedPrint.ttdDigitalPemohon ? (
                             <div className="w-16 h-16 border-[2px] border-dashed border-gray-400 flex items-center justify-center text-[8px] text-gray-500 text-center flex-col"><span className="font-bold">TTE</span><span>BSSN</span></div>
                           ) : null}
                        </div>
                        <div className="w-2/3 p-2 flex flex-col items-center justify-center">
                          <p className="mb-8">Hormat saya,</p>
                          <p className="font-bold underline text-center">({pDetail?.nama})</p>
                          <p className="text-center uppercase">{isPNS ? \'NIP\' : \'NI PPPK\'}. {pDetail?.nip}</p>
                        </div>
                      </div>
                    </div>
                  </div>"""
content = content.replace(vi_old, vi_new)

# Fix VII
vii_old = """                  {/* VII. PERTIMBANGAN ATASAN LANGSUNG */}
                  <div className="border-[1px] border-black bg-white">
                    <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">VII. PERTIMBANGAN ATASAN LANGSUNG **</div>
                    <div className="grid grid-cols-4 border-b-[0.5px] border-black text-center font-bold">
                      <div className="p-1 border-r-[0.5px] border-black">DISETUJUI</div>
                      <div className="p-1 border-r-[0.5px] border-black">PERUBAHAN ****</div>
                      <div className="p-1 border-r-[0.5px] border-black">DITANGGUHKAN ****</div>
                      <div className="p-1">TIDAK DISETUJUI ****</div>
                    </div>
                    <div className="grid grid-cols-4 min-h-[15px] border-b-[0.5px] border-black text-center">
                      <div className="p-1 border-r-[0.5px] border-black">✔</div>
                      <div className="p-1 border-r-[0.5px] border-black"></div>
                      <div className="p-1 border-r-[0.5px] border-black"></div>
                      <div className="p-1"></div>
                    </div>
                    <div className="grid grid-cols-12">
                      <div className="col-span-7 border-r-[0.5px] border-black"></div>
                      <div className="col-span-5 p-2 flex flex-col items-center">
                        <p className="font-bold text-center leading-tight mb-8">
                          {getPegawaiDetail(selectedPrint.atasanId)?.jabatan}
                        </p>
                        <p className="font-bold underline text-center">({getPegawaiNama(selectedPrint.atasanId)})</p>
                        <p className="text-center uppercase">NIP. {getPegawaiNip(selectedPrint.atasanId)}</p>
                      </div>
                    </div>
                  </div>"""

vii_new = """                  {/* VII. PERTIMBANGAN ATASAN LANGSUNG */}
                  <div className="border-[1px] border-black bg-white">
                    <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">VII. PERTIMBANGAN ATASAN LANGSUNG **</div>
                    <div className="grid grid-cols-4 border-b-[0.5px] border-black text-center font-bold">
                      <div className="p-1 border-r-[0.5px] border-black">DISETUJUI</div>
                      <div className="p-1 border-r-[0.5px] border-black">PERUBAHAN ****</div>
                      <div className="p-1 border-r-[0.5px] border-black">DITANGGUHKAN ****</div>
                      <div className="p-1">TIDAK DISETUJUI ****</div>
                    </div>
                    <div className="grid grid-cols-4 min-h-[15px] border-b-[0.5px] border-black text-center">
                      <div className="p-1 border-r-[0.5px] border-black">✔</div>
                      <div className="p-1 border-r-[0.5px] border-black"></div>
                      <div className="p-1 border-r-[0.5px] border-black"></div>
                      <div className="p-1"></div>
                    </div>
                    <div className="grid grid-cols-12">
                      <div className="col-span-5 border-r-[0.5px] border-black"></div>
                      <div className="col-span-7 flex flex-row">
                        <div className="w-1/3 flex items-center justify-center p-2">
                           {selectedPrint.ttdDigitalAtasan ? (
                             <div className="w-16 h-16 border-[2px] border-dashed border-gray-400 flex items-center justify-center text-[8px] text-gray-500 text-center flex-col"><span className="font-bold">TTE</span><span>BSSN</span></div>
                           ) : null}
                        </div>
                        <div className="w-2/3 p-2 flex flex-col items-center">
                          <p className="font-bold text-center leading-tight mb-8">
                            {getPegawaiDetail(selectedPrint.atasanId)?.jabatan}
                          </p>
                          <p className="font-bold underline text-center">({getPegawaiNama(selectedPrint.atasanId)})</p>
                          <p className="text-center uppercase">NIP. {getPegawaiNip(selectedPrint.atasanId)}</p>
                        </div>
                      </div>
                    </div>
                  </div>"""
content = content.replace(vii_old, vii_new)

# Fix VIII
viii_old = """                  {/* VIII. KEPUTUSAN PEJABAT YANG BERWENANG */}
                  <div className="border-[1px] border-black bg-white">
                    <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">VIII. KEPUTUSAN PEJABAT YANG BERWENANG MEMBERIKAN CUTI **</div>
                    <div className="grid grid-cols-4 border-b-[0.5px] border-black text-center font-bold">
                      <div className="p-1 border-r-[0.5px] border-black">DISETUJUI</div>
                      <div className="p-1 border-r-[0.5px] border-black">PERUBAHAN ****</div>
                      <div className="p-1 border-r-[0.5px] border-black">DITANGGUHKAN ****</div>
                      <div className="p-1">TIDAK DISETUJUI ****</div>
                    </div>
                    <div className="grid grid-cols-4 min-h-[15px] border-b-[0.5px] border-black text-center">
                      <div className="p-1 border-r-[0.5px] border-black">✔</div>
                      <div className="p-1 border-r-[0.5px] border-black"></div>
                      <div className="p-1 border-r-[0.5px] border-black"></div>
                      <div className="p-1"></div>
                    </div>
                    <div className="grid grid-cols-12">
                      <div className="col-span-7 border-r-[0.5px] border-black"></div>
                      <div className="col-span-5 p-2 flex flex-col items-center">
                        <p className="font-bold text-center leading-tight mb-8">
                          {getPegawaiDetail(selectedPrint.pejabatId)?.jabatan}
                        </p>
                        <p className="font-bold underline text-center">({getPegawaiNama(selectedPrint.pejabatId)})</p>
                        <p className="text-center uppercase">NIP. {getPegawaiNip(selectedPrint.pejabatId)}</p>
                      </div>
                    </div>
                  </div>"""

viii_new = """                  {/* VIII. KEPUTUSAN PEJABAT YANG BERWENANG */}
                  <div className="border-[1px] border-black bg-white">
                    <div className="p-1 font-bold border-b-[0.5px] border-black uppercase">VIII. KEPUTUSAN PEJABAT YANG BERWENANG MEMBERIKAN CUTI **</div>
                    <div className="grid grid-cols-4 border-b-[0.5px] border-black text-center font-bold">
                      <div className="p-1 border-r-[0.5px] border-black">DISETUJUI</div>
                      <div className="p-1 border-r-[0.5px] border-black">PERUBAHAN ****</div>
                      <div className="p-1 border-r-[0.5px] border-black">DITANGGUHKAN ****</div>
                      <div className="p-1">TIDAK DISETUJUI ****</div>
                    </div>
                    <div className="grid grid-cols-4 min-h-[15px] border-b-[0.5px] border-black text-center">
                      <div className="p-1 border-r-[0.5px] border-black">✔</div>
                      <div className="p-1 border-r-[0.5px] border-black"></div>
                      <div className="p-1 border-r-[0.5px] border-black"></div>
                      <div className="p-1"></div>
                    </div>
                    <div className="grid grid-cols-12">
                      <div className="col-span-5 border-r-[0.5px] border-black"></div>
                      <div className="col-span-7 flex flex-row">
                        <div className="w-1/3 flex items-center justify-center p-2">
                           {selectedPrint.ttdDigitalPejabat ? (
                             <div className="w-16 h-16 border-[2px] border-dashed border-gray-400 flex items-center justify-center text-[8px] text-gray-500 text-center flex-col"><span className="font-bold">TTE</span><span>BSSN</span></div>
                           ) : null}
                        </div>
                        <div className="w-2/3 p-2 flex flex-col items-center">
                          <p className="font-bold text-center leading-tight mb-8">
                            {getPegawaiDetail(selectedPrint.pejabatId)?.jabatan}
                          </p>
                          <p className="font-bold underline text-center">({getPegawaiNama(selectedPrint.pejabatId)})</p>
                          <p className="text-center uppercase">NIP. {getPegawaiNip(selectedPrint.pejabatId)}</p>
                        </div>
                      </div>
                    </div>
                  </div>"""
content = content.replace(viii_old, viii_new)

with open('components/CetakCutiView.tsx', 'w') as f:
    f.write(content)

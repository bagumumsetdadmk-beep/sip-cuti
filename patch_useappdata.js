const fs = require('fs');
let code = fs.readFileSync('hooks/useAppData.ts', 'utf8');

const oldUpdate = `  const updateSisaCuti = async (id: string, sc: Partial<SisaCutiTahunan>) => {`;
const newUpdate = `  const deleteSisaCuti = async (id: string) => {
    const { error } = await supabase.from('sisa_cuti_tahunan').delete().eq('id', id);
    if (!error) setSisaCuti(sisaCuti.filter(item => item.id !== id));
  };

  const updateSisaCuti = async (id: string, sc: Partial<SisaCutiTahunan>) => {`;

if (code.includes(oldUpdate)) {
  code = code.replace(oldUpdate, newUpdate);
}

const oldExport = `    addSisaCuti,
    updateSisaCuti,
    generateSisaCutiNextYear,`;
const newExport = `    addSisaCuti,
    updateSisaCuti,
    deleteSisaCuti,
    generateSisaCutiNextYear,`;

if (code.includes(oldExport)) {
  code = code.replace(oldExport, newExport);
}

fs.writeFileSync('hooks/useAppData.ts', code);

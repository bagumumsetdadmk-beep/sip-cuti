const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const oldProps = `          <SisaCutiView 
            sisaCuti={sisaCuti}
            pegawai={pegawai}
            addSisaCuti={addSisaCuti}
            updateSisaCuti={updateSisaCuti}
            generateSisaCutiNextYear={generateSisaCutiNextYear}`;
const newProps = `          <SisaCutiView 
            sisaCuti={sisaCuti}
            pegawai={pegawai}
            addSisaCuti={addSisaCuti}
            updateSisaCuti={updateSisaCuti}
            deleteSisaCuti={deleteSisaCuti}
            generateSisaCutiNextYear={generateSisaCutiNextYear}`;
if (code.includes(oldProps)) {
  code = code.replace(oldProps, newProps);
} else {
  console.log("Not found props");
}

fs.writeFileSync('app/page.tsx', code);

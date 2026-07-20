const fs = require('fs');
let code = fs.readFileSync('components/SisaCutiView.tsx', 'utf8');

const target = `    return matchesSearch && matchesTahun;
  });`;

const replacement = `    return matchesSearch && matchesTahun;
  });
  const totalPages = Math.ceil(filteredSisaBase.length / itemsPerPage);
  const filteredSisa = filteredSisaBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;

code = code.replace(`  const filteredSisa = sisaCuti.filter(sc => {`, `  const filteredSisaBase = sisaCuti.filter(sc => {`);
code = code.replace(target, replacement);

// And replace totalItems={filteredSisa.length} with filteredSisaBase
code = code.replace(/totalItems=\{filteredSisa\.length\}/g, `totalItems={filteredSisaBase.length}`);
// And replace length check in map
code = code.replace(/filteredSisa\.length === 0/g, `filteredSisaBase.length === 0`);

fs.writeFileSync('components/SisaCutiView.tsx', code);

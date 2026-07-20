const fs = require('fs');
let code = fs.readFileSync('components/PengajuanCutiView.tsx', 'utf8');

const filterEndMatch = `    return true;
  });`;

const filterEndReplace = `    return true;
  });
  const totalPages = Math.ceil(filteredPengajuanBase.length / itemsPerPage);
  const filteredPengajuan = filteredPengajuanBase.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);`;

if (code.includes(filterEndMatch)) {
  code = code.replace(filterEndMatch, filterEndReplace);
  fs.writeFileSync('components/PengajuanCutiView.tsx', code);
  console.log("Success");
} else {
  console.log("Not found");
}


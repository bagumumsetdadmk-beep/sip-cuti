const fs = require('fs');
['components/UserView.tsx', 'components/RekapCutiView.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  const target = `  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;`;
  const firstIndex = code.indexOf(target);
  if (firstIndex !== -1) {
    const nextIndex = code.indexOf(target, firstIndex + target.length);
    if (nextIndex !== -1) {
      code = code.substring(0, nextIndex) + code.substring(nextIndex + target.length);
      fs.writeFileSync(file, code);
      console.log('Removed duplicate from', file);
    }
  }
});

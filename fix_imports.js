const fs = require('fs');

const files = [
  'components/PengajuanCutiView.tsx',
  'components/RekapCutiView.tsx',
  'components/UserView.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('import Pagination')) {
    code = code.replace(`import { useToast } from '../lib/ToastContext';`, `import { useToast } from '../lib/ToastContext';\nimport Pagination from './Pagination';`);
    fs.writeFileSync(file, code);
    console.log("Added import to", file);
  }
}

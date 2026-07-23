const fs = require('fs');
let code = fs.readFileSync('app/verifikasi/page.tsx', 'utf-8');

code = code.replace(
  'onTutupVerifikasi={() => { window.location.href = \'/\'; }}',
  'onTutupVerifikasi={() => { window.close(); }}'
);

fs.writeFileSync('app/verifikasi/page.tsx', code);
console.log("Patched tutup");

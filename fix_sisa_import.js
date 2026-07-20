const fs = require('fs');
let code = fs.readFileSync('components/SisaCutiView.tsx', 'utf8');

// I will just append the missing imports if they aren't there
if (!code.includes('Trash2, X, AlertTriangle')) {
  code = code.replace(`import { `, `import { Trash2, X, AlertTriangle, `);
  fs.writeFileSync('components/SisaCutiView.tsx', code);
  console.log("Added imports");
}

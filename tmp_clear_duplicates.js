const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/app/bookmarks/page.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const startIndex = 60; // Just exact index mapping to remove lines 61-71
lines.splice(60, 11);

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Duplicate sections cleared cleanly!');

import fs from 'fs';

const file = 'c:/my-stuff/devops-hub/src/components/navbar.tsx';
let content = fs.readFileSync(file, 'utf8');

const lines = content.split('\n');
// Let's find index where line contains </DropdownMenu> twice in a row
for (let i = 0; i < lines.length - 1; i++) {
   if (lines[i].trim() === '</DropdownMenu>' && lines[i+1].trim() === '</DropdownMenu>') {
       lines.splice(i+1, 1); // remove the second one
       break;
   }
}

fs.writeFileSync(file, lines.join('\n'));
console.log('Cleaned up duplicate tag.');

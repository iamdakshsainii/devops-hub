const fs = require('fs');

const file = 'c:\\my-stuff\\devops-hub\\src\\app\\modules\\modules-client.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<\/Link>\s*\)\)/;
content = content.replace(regex, `</Link>\n                     )})`);

fs.writeFileSync(file, content);
console.log("Regex bracket cleanup applied!");

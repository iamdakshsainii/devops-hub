const fs = require('fs');

const clientFile = 'c:\\my-stuff\\devops-hub\\src\\components\\dashboard-client.tsx';
let clientContent = fs.readFileSync(clientFile, 'utf8');

clientContent = clientContent.replace(
  `<div className="grid grid-cols-2 md:grid-cols-4 gap-4">`,
  `<div className="grid grid-cols-1 md:grid-cols-3 gap-4">`
);

fs.writeFileSync(clientFile, clientContent);
console.log("Stats Grid classes adjusted smoothly!");

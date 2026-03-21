import fs from 'fs';
const path = 'c:\\my-stuff\\devops-hub\\prisma\\schema.prisma';
const c = fs.readFileSync(path, 'utf8');
const matches = [...c.matchAll(/model\s+(\w+)\s*\{/g)].map(m => m[1]);
console.log("Found Models:", matches);

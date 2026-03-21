import fs from 'fs';
const path = 'c:\\my-stuff\\devops-hub\\src\\app\\blog\\blog-content.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/className="p-4 bg-card rounded-xl border border-border\/20 flex gap-3 relative"/g, 
  'className="p-4 bg-gradient-to-br from-background/30 via-card/50 to-background/10 backdrop-blur-xl rounded-xl border border-border/10 flex gap-3 relative shadow-sm"');

c = c.replace(/bg-primary\/10 flex items-center justify-center font-bold text-xs/g, 
  'bg-primary/20 flex items-center justify-center font-bold text-xs ring-1 ring-primary/20');

c = c.replace(/\{c\.author\?\.fullName \|\| "Admin"\}/g, 
  '{c.author?.fullName || "Contributor"}');

fs.writeFileSync(path, c, 'utf8');
console.log("✅ Patcher run successfully.");

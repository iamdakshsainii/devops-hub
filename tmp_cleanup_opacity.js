const fs = require('fs');

const file = 'c:\\my-stuff\\devops-hub\\src\\app\\roadmap\\[id]\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `bg-emerald-500/10 border-emerald-500 scale-105" : "bg-card"}`;
const replacement = `bg-card border-emerald-500 scale-105" : "bg-card"}`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
}

fs.writeFileSync(file, content);
console.log("Timeline transparency fixed!");

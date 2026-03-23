const fs = require('fs');

const file = 'c:\\my-stuff\\devops-hub\\src\\app\\admin\\roadmaps\\[id]\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

// A. Replace with regex for loops
content = content.replace(/introContent: s\.introContent \|\| "",/g, '');

// B. Replace safe loop script
content = content.replace(/\/\/ Save introContent per step after roadmap metadata saved safely[\s\S]*?body: JSON\.stringify\(\{ introContent: s\.introContent \}\),[\s\S]*?\}\)[\s\S]*?\);/, '');

fs.writeFileSync(file, content);
console.log("Cleanup intro content from admin loops final done!");

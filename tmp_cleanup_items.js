const fs = require('fs');
const file = 'c:\\my-stuff\\devops-hub\\src\\app\\roadmap\\[id]\\[stepId]\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `      resources: true,
      roadmap: true,`;
const replacement1 = `      roadmap: true,`;

const target2 = `        attachedModules: attachedModulesWithProgress,
        resources: step.resources`;
const replacement2 = `        attachedModules: attachedModulesWithProgress,
        resources: []`;

if (content.indexOf(target1) !== -1) {
    content = content.replace(target1, replacement1);
    console.log("Target 1 found!");
} else {
    const targetNoCrlf = target1.replace(/\r\n/g, '\n');
    const contentNoCrlf = content.replace(/\r\n/g, '\n');
    content = contentNoCrlf.replace(targetNoCrlf, replacement1).replace(/\n/g, '\r\n');
    console.log("Target 1 found with CRLF!");
}

if (content.indexOf(target2) !== -1) {
    content = content.replace(target2, replacement2);
    console.log("Target 2 found!");
} else {
    const targetNoCrlf = target2.replace(/\r\n/g, '\n');
    const contentNoCrlf = content.replace(/\r\n/g, '\n');
    content = contentNoCrlf.replace(targetNoCrlf, replacement2).replace(/\n/g, '\r\n');
    console.log("Target 2 found with CRLF!");
}

fs.writeFileSync(file, content);
console.log("Cleanup step and resources complete!");

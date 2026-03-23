const fs = require('fs');

const file = 'c:\\my-stuff\\devops-hub\\src\\components\\step-modules-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update Progress Bar background
const barAnchor = `background: \`linear-gradient(90deg, \${roadmap.color}aa, \${roadmap.color})\`,`;
const barReplacement = `background: isMastered 
                        ? 'linear-gradient(90deg, #10b981aa, #10b981)' 
                        : \`linear-gradient(90deg, \${roadmap.color}aa, \${roadmap.color})\`,`;

if (content.includes(barAnchor)) {
    content = content.replace(barAnchor, barReplacement);
}

// 2. Update ProgressRing color prop
const ringAnchor = `<ProgressRing percent={displayPercent} color={roadmap.color}`;
const ringReplacement = `<ProgressRing percent={displayPercent} color={isMastered ? '#10b981' : roadmap.color}`;

content = content.replace(ringAnchor, ringReplacement);

fs.writeFileSync(file, content);
console.log("Mastered color triggers adjusted safely!");

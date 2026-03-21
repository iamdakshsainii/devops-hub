const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/components/step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// 1. Add Check with Lucide Imports
const importIdx = lines.findIndex(l => l.includes('from "lucide-react";'));
if (importIdx !== -1) {
    // Append , Check to previous line which list icons
    const listLineIdx = importIdx - 1;
    if (listLineIdx >= 0 && !lines[listLineIdx].includes('Check')) {
        // remove any trailing spaces safely first
        lines[listLineIdx] = lines[listLineIdx].trimRight() + ', Check';
        console.log('Lucide Check icon appended!');
    }
}

// 2. Add verification logic in map render topics
const targetSpan = `String(i + 1).padStart(2, "0")`;
let count = 0;
for (let i = 0; i < lines.length; i++) {
   if (lines[i].includes(targetSpan)) {
       console.log('Found target span on index', i);
       // Check if there's const isTopicDone = completedItems.includes(topic.id); mapped already
       // Let's replace the whole span element 
       lines[i] = lines[i].replace(targetSpan, `{completedItems.includes(topic.id) ? <Check className="h-3 w-3 text-emerald-500 font-bold" /> : String(i + 1).padStart(2, "0")}`);
       count++;
   }
}

// Write file back
fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log(`Add Checks executed on ${count} locations successfully!`);

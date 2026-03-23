const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/components/step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const targetIdx = lines.findIndex(l => l.includes('<div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>'));
if (targetIdx !== -1) {
    const checkIdx = lines.findIndex((l, idx) => idx > targetIdx && l.includes('<Checkbox'));
    if (checkIdx !== -1) {
        let endIdx = lines.findIndex((l, idx) => idx > checkIdx && l.includes('/>'));
        if (endIdx !== -1) {
             const divEndIdx = lines.findIndex((l, idx) => idx > endIdx && l.includes('</div>'));
             if (divEndIdx !== -1) {
                  lines.splice(targetIdx, (divEndIdx + 1) - targetIdx); 
                  fs.writeFileSync(file, lines.join('\n'), 'utf8');
                  console.log('Grid checkboxes successfully purged node multipliers sync!');
             }
        }
    }
} else {
    console.log('Grid index search not found!');
}

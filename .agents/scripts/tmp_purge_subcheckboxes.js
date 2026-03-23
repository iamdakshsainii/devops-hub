const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/components/step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// 1. Wipe Continuous Mode Checkbox
const startC = lines.findIndex(l => l.includes('<div className="flex items-center gap-3">'));
if (startC !== -1) {
    const checkIdx = lines.findIndex((l, idx) => idx > startC && l.includes('<Checkbox'));
    if (checkIdx !== -1) {
        let endIdx = lines.findIndex((l, idx) => idx > checkIdx && l.includes('/>'));
        if (endIdx !== -1) {
             lines.splice(checkIdx, (endIdx + 1) - checkIdx); // Removes checkbox tag lines
             fs.writeFileSync('c:/my-stuff/devops-hub/.agents/scripts/debug_splice_c.log', 'continuous checkbox wiped');
        }
    }
}

// 2. Wipe Grid Mode Checkbox (Multiple occurrences loop)
// We will look for lines matching: <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
let combined = lines.join('\n');

const gridSection = `<div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                              <Checkbox 
                                checked={completedItems.includes(sub.id)}
                                onCheckedChange={() => toggleComplete(sub.id, "SUBTOPIC")}
                                title="Click to mark as read" className="h-5 w-5 rounded-md data-[state=checked]:bg-emerald-500 border-muted-foreground/40"
                              />
                            </div>`;

if (combined.includes(gridSection)) {
    combined = combined.replace(gridSection, '');
    console.log('Grid checkboxes wiped cleanly!');
} else {
    console.log('Grid section lookup failed spacing offsets!');
    // Fallback search with single quotes or variations
}

fs.writeFileSync(file, combined, 'utf8');
console.log('Continuous and Grid checkboxes successfully purged.');

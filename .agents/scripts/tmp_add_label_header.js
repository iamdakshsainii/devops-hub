const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/components/step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const targetIdx = lines.findIndex(l => l.includes('onCheckedChange={() => toggleComplete(activeTopic.id, "TOPIC")}'));
if (targetIdx !== -1) {
    // Insert label text 2 lines downwards right after the <Checkbox /> self closing tag or after the closing bracket.
    // Line 652 in actual output is `/>` usually.
    let endCheckbox = lines.findIndex((l, idx) => idx > targetIdx && l.includes('/>'));
    if (endCheckbox !== -1) {
        lines.splice(endCheckbox + 1, 0, '                        <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider hidden md:inline-block ml-1">Mark Read</span>');
        fs.writeFileSync(file, lines.join('\n'), 'utf8');
        console.log('Visual Mark Read label added successfully!');
    }
} else {
    console.log('Target checkbox row not found!');
}

const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/app/bookmarks/page.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const targetIdx = lines.findIndex(l => l.trim() === ') : (');
if (targetIdx !== -1) {
    lines.splice(targetIdx, 0, '            </div>');
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log('Closure div tag added successfully!');
} else {
    console.log('Could not find conditional ternary target index!');
}

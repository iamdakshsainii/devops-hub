const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/components/step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('toggleBookmark(activeSubtopic.id)', 'toggleBookmark(activeSubtopic.id, "SUBTOPIC")');

fs.writeFileSync(file, content, 'utf8');
console.log('toggleBookmark calls updated successfully');

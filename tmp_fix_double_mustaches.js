const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/components/step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('{{completedItems.includes(topic.id)', '{completedItems.includes(topic.id)');
content = content.replace('.padStart(2, "0")}}</span>', '.padStart(2, "0")}</span>');

fs.writeFileSync(file, content, 'utf8');
console.log('Trailing mustaches syntax Error resolved successfully');

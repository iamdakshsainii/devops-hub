const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/app/api/bookmark/route.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('error.message', '(error as any).message');
content = content.replace('error.stack', '(error as any).stack');

fs.writeFileSync(file, content, 'utf8');
console.log('API trace error casted correctly.');

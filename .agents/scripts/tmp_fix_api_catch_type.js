const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/app/api/bookmark/route.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('catch (error)', 'catch (error: any)');

fs.writeFileSync(file, content, 'utf8');
console.log('Catch parameter cast successfully!');

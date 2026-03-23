const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/app/api/bookmark/route.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `    fs.appendFileSync('c:/my-stuff/devops-hub/.agents/scripts/bookmark_route_trace.log', JSON.stringify({ error: (error as any).message, stack: (error as any).stack }) + '\\n');`;

if (content.includes(target)) {
    content = content.replace(target, '');
    fs.writeFileSync(file, content, 'utf8');
    console.log('API Trace logging removed.');
} else {
    console.log('Target logging row not found!');
}

const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/app/bookmarks/page.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const insertPos = lines.findIndex(l => l.includes('// Split events into saved and remindMe'));
if (insertPos !== -1) {
    const vars = [
      '  const resourceBookmarks = typeof resourceBookmarkRows !== "undefined" ? resourceBookmarkRows.map((b) => ({ ...b, resource: resourceMap[b.resourceId!] })).filter((b) => b.resource) : [];',
      ''
    ];
    lines.splice(insertPos, 0, ...vars);
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log('resourceBookmarks restored successfully!');
} else {
    console.log('Insert anchor index not found!');
}

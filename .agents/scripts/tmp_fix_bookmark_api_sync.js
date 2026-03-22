const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/components/step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const targetIdx = lines.findIndex(l => l.includes('const toggleBookmark = (id: string) =>'));
if (targetIdx !== -1) {
    const endIdx = lines.findIndex((l, idx) => idx > targetIdx && l.includes('};'));
    if (endIdx !== -1) {
        lines.splice(targetIdx, (endIdx + 1) - targetIdx, 
            '  const toggleBookmark = async (id: string, itemType: string = "TOPIC") => {',
            '    const isBookmarked = bookmarkedItems.includes(id);',
            '    const next = isBookmarked ? bookmarkedItems.filter(b => b !== id) : [...bookmarkedItems, id];',
            '    setBookmarkedItems(next);',
            '    localStorage.setItem("my_bookmarks", JSON.stringify(next));',
            '    try {',
            '      await fetch(\'/api/bookmark\', {',
            '        method: \'POST\',',
            '        headers: { \'Content-Type\': \'application/json\' },',
            '        body: JSON.stringify({ itemId: id, itemType })',
            '      });',
            '    } catch (e) {}',
            '  };'
        );
        fs.writeFileSync(file, lines.join('\n'), 'utf8');
        console.log('Database Bookmark sync executed successfully!');
    }
} else {
    console.log('toggleBookmark target not found!');
}

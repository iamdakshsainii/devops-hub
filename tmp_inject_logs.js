const fs = require('fs');
const path = require('path');
const file1 = 'c:/my-stuff/devops-hub/src/app/api/bookmark/route.ts';
const file2 = 'c:/my-stuff/devops-hub/src/app/bookmarks/page.tsx';

// 1. Debug API Route
if (fs.existsSync(file1)) {
    let content = fs.readFileSync(file1, 'utf8');
    const logs = `const fs = require('fs');\nfs.appendFileSync('c:/my-stuff/devops-hub/.agents/scripts/bookmark_route_trace.log', JSON.stringify({ timestamp: new Date().toISOString(), itemId, itemType, whereClause }) + '\\n');`;
    
    // Inject at the start after creating whereClause
    content = content.replace('const existing = await prisma.bookmark.findFirst({ where: whereClause });', 
    `const fs = require('fs');\nfs.appendFileSync('c:/my-stuff/devops-hub/.agents/scripts/bookmark_route_trace.log', JSON.stringify({ timestamp: new Date().toISOString(), itemId, itemType, whereClause }) + '\\n');\nconst existing = await prisma.bookmark.findFirst({ where: whereClause });`);
    
    // Catch block
    content = content.replace('console.error("Bookmark error:", error);', `fs.appendFileSync('c:/my-stuff/devops-hub/.agents/scripts/bookmark_route_trace.log', JSON.stringify({ error: error.message, stack: error.stack }) + '\\n');\nconsole.error("Bookmark error:", error);`);
    
    fs.writeFileSync(file1, content, 'utf8');
    console.log('/api/bookmark logged.');
}

// 2. Debug Bookmarks Page fetch
if (fs.existsSync(file2)) {
    let content = fs.readFileSync(file2, 'utf8');
    
    // Inject after rawBookmarks fetch
    content = content.replace('// Separate by type', `const fs = require('fs');\nfs.writeFileSync('c:/my-stuff/devops-hub/.agents/scripts/bookmark_page_trace.log', JSON.stringify({ rawBookmarksTotal: rawBookmarks.length, rawBookmarks }) + '\\n');\n// Separate by type`);
    
    fs.writeFileSync(file2, content, 'utf8');
    console.log('/bookmarks page logged.');
}

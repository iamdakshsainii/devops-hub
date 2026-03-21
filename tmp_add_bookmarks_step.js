const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/components/step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { Bookmark }')) {
  content = content.replace(
    /import \{ Search/g, 
    'import { Search, Bookmark'
  );
}

// Add bookmark icon to paginated view header
if (!content.includes('onClick={() => toggleBookmark(')) {
  content = content.replace(
    /<div className="flex items-center gap-3">\n\s*\{activeView\.kind === "subtopic"/g,
    `<div className="flex items-center gap-3">
                  {activeView.kind === "subtopic" && activeSubtopic && viewMode === "PAGINATED" && (
                     <button onClick={() => toggleBookmark(activeSubtopic.id)} className={\`p-1.5 rounded-lg border transition-all \${bookmarkedItems.includes(activeSubtopic.id) ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/30 text-muted-foreground border-transparent hover:border-border"}\`}>
                       <Bookmark className="h-4 w-4" />
                     </button>
                  )}
                  {activeView.kind === "topic" && activeTopic && viewMode === "PAGINATED" && activeTopic.content && (
                     <button onClick={() => toggleBookmark(activeTopic.id)} className={\`p-1.5 rounded-lg border transition-all \${bookmarkedItems.includes(activeTopic.id) ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/30 text-muted-foreground border-transparent hover:border-border"}\`}>
                       <Bookmark className="h-4 w-4" />
                     </button>
                  )}
                  {activeView.kind === "subtopic"`
  );
}

// Add bookmark icon to continuous subtopic map view header
if (content.includes('checked={completedItems.includes(sub.id)}')) {
  content = content.replace(
    /<div className="flex items-center gap-3">\n\s*<Checkbox \n\s*checked=\{completedItems.includes\(sub.id\)\}/g,
    `<div className="flex items-center gap-3">
                              <button onClick={() => toggleBookmark(sub.id)} className={\`p-1 rounded border transition-all \${bookmarkedItems.includes(sub.id) ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/10 text-muted-foreground border-transparent hover:border-border hover:bg-muted"}\`}>
                                <Bookmark className="h-4 w-4" />
                              </button>
                              <Checkbox 
                                checked={completedItems.includes(sub.id)}`
  );
}

fs.writeFileSync(file, content, 'utf8');
console.log('Script updated step viewer bookmarks successfully');

const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/components/step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const startIdx = lines.findIndex(l => l.includes('<div className="flex items-center gap-3">') && l.trim() === '<div className="flex items-center gap-3">');
const endIdx = lines.findIndex((l, idx) => idx > startIdx && l.includes('</h1>') && l.trim() === '</h1>');

if (startIdx !== -1 && endIdx !== -1) {
    // We want to replace everything inside <div className="flex items-center gap-3"> up to <div className="flex items-center gap-3"> mapped wrapper
    // Actually from header closing up strictly
    let topHeaderIdx = lines.findIndex(l => l.includes('header className="mb-10 pb-8'));
    if (topHeaderIdx !== -1) {
       let blockStart = lines.findIndex((l, idx) => idx > topHeaderIdx && l.includes('<div className="flex items-center gap-3">'));
       let blockEnd = lines.findIndex((l, idx) => idx > blockStart && l.includes('</h1>'));
       if (blockStart !== -1 && blockEnd !== -1) {
           const replacement = [
              '                <div className="flex items-center gap-3">',
              '                  {activeTopic && (',
              '                    <div className="flex items-center gap-3">',
              '                       <button title="Add bookmark and see in saved content from profile dropdown anytime" onClick={() => toggleBookmark(activeTopic.id)} className={`p-1.5 rounded-lg border transition-all ${bookmarkedItems.includes(activeTopic.id) ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/30 text-muted-foreground border-transparent hover:border-border"}`}>',
              '                         <Bookmark className="h-4 w-4" />',
              '                       </button>',
              '                       <Checkbox ',
              '                         checked={completedItems.includes(activeTopic.id)} ',
              '                         onCheckedChange={() => toggleComplete(activeTopic.id, "TOPIC")} ',
              '                         title="Click to mark as read" className="h-5 w-5 data-[state=checked]:bg-emerald-500 border-muted-foreground/40 rounded-md transition-colors"',
              '                       />',
              '                    </div>',
              '                  )}',
              '                  {activeView.kind === "subtopic" && activeSubtopic && viewMode === "PAGINATED" && (',
              '                     <button title="Add bookmark and see in saved content from profile dropdown anytime" onClick={() => toggleBookmark(activeSubtopic.id)} className={`p-1 rounded border border-transparent text-muted-foreground hover:bg-muted/10`}>',
              '                       <Bookmark className="h-3.5 w-3.5" />',
              '                     </button>',
              '                  )}',
              '                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-foreground/95">',
              '                    {activeView.kind === "subtopic" && activeSubtopic && viewMode === "PAGINATED" ? activeSubtopic.title : activeTopic?.title}'
           ];
           lines.splice(blockStart, (blockEnd) - blockStart, ...replacement);
           fs.writeFileSync(file, lines.join('\n'), 'utf8');
           console.log('Splice header executed cleanly!');
       } else {
           console.log('Could not match inner flex wrapper nodes!');
       }
    }
} else {
    console.log('Wrapper node boundaries not found!');
}

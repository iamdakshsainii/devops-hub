const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/components/step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change getTotalItemsCount
content = content.replace(
  /const getTotalItemsCount = useCallback\([^]*?return count;\n  }, \[step\.topics\]\);/,
  `const getTotalItemsCount = useCallback(() => {
    return step.topics.length;
  }, [step.topics]);`
);

// 2. Change thickness of sticky progress bar
content = content.replace(
  /h-\[3px\] bg-emerald-500/,
  'h-[6px] bg-emerald-500'
);

// 3. Mark all complete button & sweet msg logic inject in Breadcrumb
const sweetMsgInject = `
        {completionPercentage === 100 && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-500 text-xs font-bold py-1.5 px-4 text-center">
             🎉 Awesome! You've mastered all topics in this step. Keep the momentum going!
          </div>
        )}
        <div className="absolute bottom-0 left-0`;

content = content.replace(
  /<div className="absolute bottom-0 left-0/g,
  sweetMsgInject
);

// Mark all complete button inject near header right side
const markAllInject = `
          {!isStandalone ? (
            <>
              <Link href="/roadmap"`;

const markAllButton = `
          <div className="flex-1" />
          {completionPercentage < 100 && (
            <button 
              onClick={() => {
                 const allTopicIds = step.topics.map(t => t.id);
                 setCompletedItems(allTopicIds);
                 localStorage.setItem(\`completed_module_\${step.id}\`, JSON.stringify(allTopicIds));
                 allTopicIds.forEach(id => {
                   fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemId: id, itemType: "TOPIC", completed: true }) }).catch(()=>{});
                 });
                 import('canvas-confetti').then(confetti => confetti.default());
              }}
              className="text-xs font-bold px-3 py-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all rounded-md tracking-tight shrink-0 mr-4"
            >
              Mark Full Step Complete ⚡
            </button>
          )}` + markAllInject;
          
content = content.replace(markAllInject, markAllButton);

// 4. Update titles for checkboxes & bookmarks
content = content.replace(/<Bookmark className="h-4 w-4" \/>/g, '<Bookmark className="h-4 w-4" />');
// Actually, just add title attributes to the wrapper buttons and Checkboxes
content = content.replace(
  /onClick=\{\(\) => toggleBookmark\(activeSubtopic\.id\)\} className=\{/g,
  'title="Add bookmark and see in saved content from profile dropdown anytime" onClick={() => toggleBookmark(activeSubtopic.id)} className={'
);
content = content.replace(
  /onClick=\{\(\) => toggleBookmark\(activeTopic\.id\)\} className=\{/g,
  'title="Add bookmark and see in saved content from profile dropdown anytime" onClick={() => toggleBookmark(activeTopic.id)} className={'
);
content = content.replace(
  /onClick=\{\(\) => toggleBookmark\(sub\.id\)\} className=\{/g,
  'title="Add bookmark and see in saved content from profile dropdown anytime" onClick={() => toggleBookmark(sub.id)} className={'
);
content = content.replace(
  /className="h-5 w-5 data-\[state=checked\]:bg-emerald-500/g,
  'title="Click to mark as read" className="h-5 w-5 data-[state=checked]:bg-emerald-500'
);
content = content.replace(
  /className="h-5 w-5 rounded-md data-\[state=checked\]:bg-emerald/g,
  'title="Click to mark as read" className="h-5 w-5 rounded-md data-[state=checked]:bg-emerald'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Script updated step viewer topics cleanly');

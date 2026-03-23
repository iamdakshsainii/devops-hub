const fs = require('fs');
const file = 'c:\\my-stuff\\devops-hub\\src\\components\\step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Find the precise corrupted region starting from header closing 
const headerCloseIdx = lines.findIndex(l => l.includes('</header>'));

// Find where activeTopic ? ( starts BELOW headerCloseIdx
const activeTopicIdx = lines.findIndex((l, idx) => idx > headerCloseIdx && l.includes('activeTopic ? ('));

if (headerCloseIdx > -1 && activeTopicIdx > -1) {
    const customMiddle = `              {viewMode === "CONTINUOUS" ? (
                 <div className="space-y-16">
                    {step.topics.map((topic) => (
                       <div key={topic.id} id={\`topic-\${topic.id}\`} className="space-y-8 pt-12 border-t border-border/10 first:pt-0 first:border-0">
                           <div className="pb-4">
                                <h1 className="text-3xl font-black tracking-tight text-foreground/90">\${topic.title}</h1>
                           </div>
                           {topic.content && <div className={PROSE} dangerouslySetInnerHTML={{ __html: parseMarkdown(topic.content) }} />}
                           
                           {topic.subtopics && topic.subtopics.length > 0 && (
                                <div className="space-y-14 mt-8">
                                     {topic.subtopics.map((sub) => (
                                         <div key={sub.id} id={\`subtopic-\${sub.id}\`} className="space-y-4 pt-12 border-t border-border/10 first:pt-0 first:border-0">
                                               <h2 className="text-2xl font-bold tracking-tight text-foreground/80">\${sub.title}</h2>
                                               <div className={PROSE} dangerouslySetInnerHTML={{ __html: parseMarkdown(sub.content) }} />
                                         </div>
                                     ))}
                                </div>
                           )}
                       </div>
                    ))}
                 </div>
               ) : activeView.kind === "subtopic" && activeSubtopic ? (
                 <div className={PROSE} dangerouslySetInnerHTML={{ __html: parseMarkdown(activeSubtopic.content) }} />
               ) : activeTopic ? (`;

    // Replace everything between headerCloseIdx + 1 and activeTopicIdx
    lines.splice(headerCloseIdx + 1, activeTopicIdx - headerCloseIdx, customMiddle + '\n');
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log("Success with splice");
} else {
    console.log("Failed to locate lines");
}

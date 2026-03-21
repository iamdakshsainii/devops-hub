const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/components/step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the subtopic header checkbox and topic title
const targetHeader = `                <div className="flex items-center gap-3">
                  {activeView.kind === "subtopic" && activeSubtopic && viewMode === "PAGINATED" && (
                    <div className="flex items-center gap-3">
                      <button title="Add bookmark and see in saved content from profile dropdown anytime" onClick={() => toggleBookmark(activeSubtopic.id)} className={\`p-1.5 rounded-lg border transition-all \${bookmarkedItems.includes(activeSubtopic.id) ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/30 text-muted-foreground border-transparent hover:border-border"}\`}>
                       <Bookmark className="h-4 w-4" />
                      </button>
                      <Checkbox 
                        checked={completedItems.includes(activeSubtopic.id)} 
                        onCheckedChange={() => toggleComplete(activeSubtopic.id, "SUBTOPIC")} 
                        title="Click to mark as read" className="h-5 w-5 data-[state=checked]:bg-emerald-500 border-muted-foreground/40 rounded-md transition-colors"
                      />
                    </div>
                  )}
                  {activeView.kind === "topic" && activeTopic && viewMode === "PAGINATED" && activeTopic.content && (
                     <button title="Add bookmark and see in saved content from profile dropdown anytime" onClick={() => toggleBookmark(activeTopic.id)} className={\`p-1.5 rounded-lg border transition-all \${bookmarkedItems.includes(activeTopic.id) ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/30 text-muted-foreground border-transparent hover:border-border"}\`}>
                       <Bookmark className="h-4 w-4" />
                     </button>
                  )}`;

const newHeader = `                <div className="flex items-center gap-3">
                  {activeView.kind === "subtopic" && activeSubtopic && viewMode === "PAGINATED" && (
                    <div className="flex flex-row items-center gap-3">
                      <button title="Add bookmark and see in saved content from profile dropdown anytime" onClick={() => toggleBookmark(activeSubtopic.id)} className={\`p-1.5 rounded-lg border transition-all \${bookmarkedItems.includes(activeSubtopic.id) ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/30 text-muted-foreground border-transparent hover:border-border"}\`}>
                       <Bookmark className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {activeTopic && (
                     <div className="flex items-center gap-3">
                       <button title="Add bookmark and see in saved content from profile dropdown anytime" onClick={() => toggleBookmark(activeTopic.id)} className={\`p-1.5 rounded-lg border transition-all \${bookmarkedItems.includes(activeTopic.id) ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/30 text-muted-foreground border-transparent hover:border-border"}\`}>
                         <Bookmark className="h-4 w-4" />
                       </button>
                       <Checkbox 
                         checked={completedItems.includes(activeTopic.id)} 
                         onCheckedChange={() => toggleComplete(activeTopic.id, "TOPIC")} 
                         title="Click to mark as read" 
                         className="h-5 w-5 data-[state=checked]:bg-emerald-500 border-muted-foreground/40 rounded-md transition-colors"
                       />
                     </div>
                  )}`;

content = content.replace(targetHeader, newHeader);

// Now remove the Subtopic map checkbox in CONTINUOUS mode
const subtopicMapTarget = `                            <div className="flex items-center gap-3">
                              <Checkbox 
                                checked={completedItems.includes(sub.id)} 
                                onCheckedChange={() => toggleComplete(sub.id, "SUBTOPIC")} 
                                title="Click to mark as read" className="h-5 w-5 data-[state=checked]:bg-emerald-500 border-muted-foreground/40 rounded-md transition-colors"
                              />`;

const subtopicMapNew = `                            <div className="flex items-center gap-3">`;
content = content.replace(subtopicMapTarget, subtopicMapNew);

// Remove the Subtopic Card checkbox in PACINATED map map
const gridCardTarget = `                            <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                              <Checkbox 
                                checked={completedItems.includes(sub.id)}
                                onCheckedChange={() => toggleComplete(sub.id, "SUBTOPIC")}
                                className="h-5 w-5 rounded-md data-[state=checked]:bg-emerald-500 border-muted-foreground/40"
                              />
                            </div>`;
content = content.replace(gridCardTarget, '');


fs.writeFileSync(file, content, 'utf8');
console.log("Checkbox migration to TOPIC ONLY done");

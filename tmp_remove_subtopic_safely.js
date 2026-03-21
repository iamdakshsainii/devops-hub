const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/components/step-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove that continuous checkbox
const continuousTarget = `                            <div className="flex items-center gap-3">
                              <Checkbox 
                                checked={completedItems.includes(sub.id)} 
                                onCheckedChange={() => toggleComplete(sub.id, "SUBTOPIC")} 
                                title="Click to mark as read" className="h-5 w-5 data-[state=checked]:bg-emerald-500 border-muted-foreground/40 rounded-md transition-colors"
                              />
                              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{sub.title}</h2>
                            </div>`;

const continuousNew = `                            <div className="flex items-center gap-3">
                              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{sub.title}</h2>
                            </div>`;

content = content.replace(continuousTarget, continuousNew);

// 2. Remove the subtopic paginated cards check too if still there
const gridTarget = `                            <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                              <Checkbox 
                                checked={completedItems.includes(sub.id)}
                                onCheckedChange={() => toggleComplete(sub.id, "SUBTOPIC")}
                                className="h-5 w-5 rounded-md data-[state=checked]:bg-emerald-500 border-muted-foreground/40"
                              />
                            </div>`;

content = content.replace(gridTarget, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Continuous and Grid checkboxes removed successfully');

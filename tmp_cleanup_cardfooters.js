const fs = require('fs');

const file = 'c:\\my-stuff\\devops-hub\\src\\app\\roadmap\\[id]\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Library to Lucide imports
const importOld = `import { ArrowRight, BookOpen, ChevronLeft, Map } from "lucide-react";`;
const importNew = `import { ArrowRight, BookOpen, ChevronLeft, Library, Map } from "lucide-react";`;

if (content.includes(importOld)) {
    content = content.replace(importOld, importNew);
}

// 2. Remove Topics section
const topicsSectionAnchor = `                  {(step as any).topics && (step as any).topics.length > 0 && (
                     <div className="flex flex-wrap gap-1.5 mt-4">
                        {(step as any).topics.map((t: any) => (
                           <div 
                              key={t.id} 
                              className="text-[11px] bg-muted/50 text-foreground/80 px-2 py-0.5 rounded border border-border/30 font-medium"
                           >
                              {t.title}
                           </div>
                        ))}
                        {step._count.topics > 3 && (
                           <div className="text-[11px] text-muted-foreground/60 px-1 py-0.5">
                              +{step._count.topics - 3} more...
                           </div>
                        )}
                     </div>
                  )}`;

if (content.includes(topicsSectionAnchor)) {
    content = content.replace(topicsSectionAnchor, "                  ");
} else {
    // Relaxedspacer match
    const regex = /\{\(step as any\)\.topics[\s\S]*?\+{step\._count\.topics - 3} more\.\.\.[\s\S]*?<\/div>[\s\S]*?\}\s*<\/div>\s*\}\)/;
    content = content.replace(/\{\(step as any\)\.topics[\s\S]*?more\.\.\.[\s\S]*?\}[\s\S]*?<\/div>[\s\S]*?\}\)/, " ");
}

// 3. Update bottom Badges
const statBadgesAnchor = `<div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-md">
                      <BookOpen className="h-4 w-4" style={{ color: roadmap.color }} />
                      <span>{step._count.topics} Topics</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-md">
                      <span className="text-base leading-none" style={{ color: roadmap.color }}>📎</span>
                      <span>{step._count.resources} Resources</span>
                    </div>`;

const statBadgesReplacement = `<div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-md">
                      <Library className="h-4 w-4" style={{ color: roadmap.color }} />
                      <span>{(step as any).attachedModules?.length || 0} Modules</span>
                    </div>`;

if (content.includes(statBadgesAnchor)) {
    content = content.replace(statBadgesAnchor, statBadgesReplacement);
} else {
    // Spacer match fallback
    const tNoCrlf = statBadgesAnchor.replace(/\r\n/g, '\n');
    const cNoCrlf = content.replace(/\r\n/g, '\n');
    content = cNoCrlf.replace(tNoCrlf, statBadgesReplacement).replace(/\n/g, '\r\n');
}

fs.writeFileSync(file, content);
console.log("Card footers cleanup applied successfully!");

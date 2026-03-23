const fs = require('fs');

const file = 'c:\\my-stuff\\devops-hub\\src\\app\\roadmap\\[id]\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove "x Topics total" from Top Hero Badge node
const badgeOld = `<div className="inline-flex items-center gap-2 rounded-full border border-border/10 bg-muted/20 px-3.5 py-1 text-[11px] font-bold text-foreground/90 shadow-sm">
                    <Map className="h-3.5 w-3.5" style={{ color: roadmap.color }} />
                    {roadmap.steps.length} Steps · <span className="text-muted-foreground ml-0.5">{totalTopics} Topics total</span>
                </div>`;

const badgeNew = `<div className="inline-flex items-center gap-2 rounded-full border border-border/10 bg-muted/20 px-3.5 py-1 text-[11px] font-bold text-foreground/90 shadow-sm">
                    <Map className="h-3.5 w-3.5" style={{ color: roadmap.color }} />
                    {roadmap.steps.length} Steps
                </div>`;

if (content.includes(badgeOld)) {
    content = content.replace(badgeOld, badgeNew);
} else {
    // Spacer matching if exact breaks
    content = content.replace(/\{roadmap\.steps\.length\}\s*Steps\s*·\s*<span className="text-muted-foreground ml-0.5">\{totalTopics\}\s*Topics\s*total<\/span>/, `{roadmap.steps.length} Steps`);
}

fs.writeFileSync(file, content);
console.log("Topics badge removed from Super Hero successfully!");

import fs from 'fs';

const path = 'c:\\my-stuff\\devops-hub\\src\\app\\modules\\modules-client.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Glow div to Card
const cardTarget = `<Card className="h-full hover:shadow-xl hover:border-foreground/30 transition-all duration-300 relative overflow-hidden flex flex-col items-start bg-card">`;
const glowDiv = `
                           {/* Backlight Glow Animation */}
                           <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-0 group-hover:opacity-25 transition-all duration-300 pointer-events-none" style={{ backgroundColor: cyclingColors[index % cyclingColors.length] }} />`;

if (content.includes(cardTarget)) {
  content = content.replace(cardTarget, cardTarget + glowDiv);
}

// 2. Add Tags structure above `<div className="flex items-center gap-4 mt-auto text-xs font-semibold text-muted-foreground pt-4 border-t border-border/30">`
const footerTarget = `mt-auto text-xs font-semibold text-muted-foreground pt-4 border-t border-border/30`;
const tagsBlock = `
                              {mod.tags && (
                                 <div className="flex flex-wrap gap-1 mt-auto mb-4">
                                    {mod.tags.split(",").map((t: string) => (
                                       <div key={t} className="text-[10px] bg-muted/40 text-muted-foreground/80 px-1.5 py-0.5 rounded border border-border/20 font-semibold">
                                          {t.trim()}
                                       </div>
                                    ))}
                                 </div>
                              )}
                              <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground pt-4 border-t border-border/30">`;

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(footerTarget)) {
    // replace `mt-auto text-xs` to remove mt-auto and prepend tags
    lines[i] = tagsBlock;
    break;
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('File successfully updated!');

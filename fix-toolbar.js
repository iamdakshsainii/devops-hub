const fs = require('fs');
const file = 'c:\\my-stuff\\devops-hub\\src\\app\\admin\\modules\\[id]\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetCut = `                                 <Button 
                                   type="button" 
                                   variant="ghost" 
                                   size="sm" 
                                   className="h-6 text-[10px] items-center gap-1.5 px-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                                   onClick={() => document.execCommand('cut')}
                                 >
                                   Cut
                                 </Button>`;

const replacementCut = `                                 <Button 
                                   type="button" 
                                   variant="ghost" 
                                   size="sm" 
                                   className="h-6 text-[10px] items-center gap-1.5 px-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                                   onClick={() => {
                                     const textarea = document.getElementById(\`textarea-intro-\${ti}\`) as HTMLTextAreaElement;
                                     if (textarea) { textarea.focus(); document.execCommand('cut'); }
                                   }}
                                 >
                                   Cut
                                 </Button>`;

const targetCopy = `                                 <Button 
                                   type="button" 
                                   variant="ghost" 
                                   size="sm" 
                                   className="h-6 text-[10px] items-center gap-1.5 px-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                                   onClick={() => document.execCommand('copy')}
                                 >
                                   Copy
                                 </Button>`;

const replacementCopy = `                                 <Button 
                                   type="button" 
                                   variant="ghost" 
                                   size="sm" 
                                   className="h-6 text-[10px] items-center gap-1.5 px-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                                   onClick={() => {
                                     const textarea = document.getElementById(\`textarea-intro-\${ti}\`) as HTMLTextAreaElement;
                                     if (textarea) { textarea.focus(); document.execCommand('copy'); }
                                   }}
                                 >
                                   Copy
                                 </Button>

                                 <Button 
                                   type="button" 
                                   variant="ghost" 
                                   size="sm" 
                                   className={\`h-6 text-[10px] font-semibold items-center gap-1 px-1.5 transition-all \${(wordWrap[ti] ?? true) ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted/50"}\`}
                                   onClick={() => setWordWrap(prev => ({ ...prev, [ti]: !(prev[ti] ?? true) }))}
                                   title="Toggle Text Wrap"
                                 >
                                   Wrap
                                 </Button>`;

content = content.replace(targetCut, replacementCut);
content = content.replace(targetCopy, replacementCopy);

fs.writeFileSync(file, content, 'utf8');
console.log("Replaced successfully");

const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/app/modules/modules-client.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded">
                                   <BookOpen className="h-3.5 w-3.5" style={{ color: cyclingColors[index % cyclingColors.length] }}/>
                                   {mod._count.topics} Topics
                                </span>`;

const replacement = `<span className={\`flex items-center gap-1.5 px-2 py-1 rounded \${mod.trackingTotal && mod.trackingCompleted === mod.trackingTotal ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-muted/50"}\`}>
                                   <BookOpen className="h-3.5 w-3.5" style={{ color: mod.trackingTotal && mod.trackingCompleted === mod.trackingTotal ? "#10b981" : cyclingColors[index % cyclingColors.length] }}/>
                                   {mod.trackingTotal !== undefined && mod.trackingTotal > 0 ? (
                                      <span className={mod.trackingCompleted === mod.trackingTotal ? "font-bold" : ""}>
                                        {mod.trackingCompleted} / {mod.trackingTotal} Topics
                                      </span>
                                   ) : (
                                      <span>{mod._count.topics} Topics</span>
                                   )}
                                </span>`;

if (content.includes('{mod._count.topics} Topics')) {
    const parts = content.split('{mod._count.topics} Topics');
    let idx1 = content.lastIndexOf('<span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded">', content.indexOf('{mod._count.topics} Topics'));
    let idx2 = content.indexOf('</span>', content.indexOf('{mod._count.topics} Topics')) + 7;
    
    const chunkToReplace = content.substring(idx1, idx2);
    content = content.replace(chunkToReplace, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Success topics counter replaced.");
} else {
    console.log("Target not found");
}

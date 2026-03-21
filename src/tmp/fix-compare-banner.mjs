import fs from 'fs';
const path = 'c:\\my-stuff\\devops-hub\\src\\app\\tools\\compare\\[id]\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Include PlusCircle and FileText from lucide-react just in case
if (!content.includes("PlusCircle")) {
  content = content.replace('ArrowLeft, GitMerge', 'ArrowLeft, GitMerge, PlusCircle, FileText');
}

const includeA = `toolA: { select: { name: true, slug: true, icon: true } }`;
const includeANew = `toolA: { select: { name: true, slug: true, icon: true, moduleUrl: true, resourceUrl: true } }`;
const includeB = `toolB: { select: { name: true, slug: true, icon: true } }`;
const includeBNew = `toolB: { select: { name: true, slug: true, icon: true, moduleUrl: true, resourceUrl: true } }`;

content = content.replace(includeA, includeANew).replace(includeB, includeBNew);

const target = `<div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden">`;
const banner = `{(comp.toolA?.moduleUrl || comp.toolA?.resourceUrl || comp.toolB?.moduleUrl || comp.toolB?.resourceUrl) && (
         <div className="bg-primary/5 p-4 rounded-xl border border-dashed border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="space-y-1">
                 <h4 className="text-sm font-bold flex items-center gap-1.5"><PlusCircle className="h-4 w-4 text-primary" /> Learn these deeply?</h4>
                 <p className="text-xs text-muted-foreground">Explore modules and materials tailored setups attached below.</p>
             </div>
             <div className="flex gap-1.5 shrink-0 flex-wrap">
                 {comp.toolA?.moduleUrl && (
                      <Link href={comp.toolA.moduleUrl}>
                          <Button size="sm" className="h-7 text-[10px] gap-1"><PlusCircle className="h-3 w-3" /> Study {comp.toolA.name}</Button>
                      </Link>
                 )}
                 {comp.toolB?.moduleUrl && (
                      <Link href={comp.toolB.moduleUrl}>
                          <Button size="sm" className="h-7 text-[10px] gap-1"><PlusCircle className="h-3 w-3" /> Study {comp.toolB.name}</Button>
                      </Link>
                 )}
             </div>
         </div>
      )}

      `;

if (content.includes(target)) {
  content = content.replace(target, banner + target);
  fs.writeFileSync(path, content, 'utf8');
  console.log("✅ Comparison banner added");
} else {
  console.log("❌ Target compare grid not found");
}

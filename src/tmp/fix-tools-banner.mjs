import fs from 'fs';
const path = 'c:\\my-stuff\\devops-hub\\src\\app\\tools\\[slug]\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">`;
const banner = `{(tool.moduleUrl || tool.resourceUrl) && (
         <div className="bg-primary/5 p-4 rounded-xl border border-dashed border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
             <div className="space-y-1">
                 <h4 className="text-sm font-bold flex items-center gap-1.5"><GitMerge className="h-4 w-4 text-primary" /> Want to learn {tool.name} deeply?</h4>
                 <p className="text-xs text-muted-foreground">Explore our tailored modules and learning materials setup natively synced.</p>
             </div>
             <div className="flex gap-2 shrink-0">
                 {tool.moduleUrl && (
                      <Link href={tool.moduleUrl}>
                          <Button size="sm" className="h-8 text-xs gap-1"><Check className="h-3.5 w-3.5" /> Study Module</Button>
                      </Link>
                 )}
                 {tool.resourceUrl && (
                      <Link href={tool.resourceUrl}>
                          <Button variant="outline" size="sm" className="h-8 text-xs gap-1"><FileText className="h-3.5 w-3.5" /> Read Resource</Button>
                      </Link>
                 )}
             </div>
         </div>
      )}

      `;

if (content.includes(target)) {
  content = content.replace(target, banner + target);
  fs.writeFileSync(path, content, 'utf8');
  console.log("✅ Banner Added");
} else {
  console.log("❌ Target grid not found");
}

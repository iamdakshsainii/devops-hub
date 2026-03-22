const fs = require('fs');
const file = 'c:/my-stuff/devops-hub/src/app/modules/modules-client.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('<option value="BEGINNER">')) {
  content = content.replace(
    /<div className="space-y-2">\s*<label[^>]*>Track \/ Domain<\/label>/,
    match => `<div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Difficulty</label>
                  <select 
                     value={difficultyFilter} 
                     onChange={e => setDifficultyFilter(e.target.value)}
                     className="flex h-9 w-full rounded-md border border-input bg-background/80 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                     <option value="ALL">All Levels</option>
                     <option value="BEGINNER">Beginner</option>
                     <option value="INTERMEDIATE">Intermediate</option>
                     <option value="ADVANCED">Advanced</option>
                  </select>
               </div>\n\n               ` + match
  );
}

fs.writeFileSync(file, content, 'utf8');
console.log('Sidebar patched successfully');

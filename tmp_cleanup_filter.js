const fs = require('fs');

const file = 'c:\\my-stuff\\devops-hub\\src\\app\\modules\\modules-client.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add State
const stateAnchor = `   const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");`;
const stateReplacement = `   const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
   const [completionFilter, setCompletionFilter] = useState<"ALL" | "NEW" | "IN_PROGRESS" | "COMPLETED">("ALL");`;

if (content.includes(stateAnchor)) {
    content = content.replace(stateAnchor, stateReplacement);
}

// 2. Add filtering inside filteredModules
const filterAnchor = `         const matchesDifficulty = difficultyFilter === "ALL" || (mod.tags && mod.tags.toLowerCase().includes(difficultyFilter.toLowerCase()));
         return matchesSearch && matchesRoadmap && matchesType && matchesDifficulty;`;

const filterReplacement = `         const matchesDifficulty = difficultyFilter === "ALL" || (mod.tags && mod.tags.toLowerCase().includes(difficultyFilter.toLowerCase()));
         
         const matchesCompletion = 
            completionFilter === "ALL" ? true :
            completionFilter === "COMPLETED" ? (mod.trackingTotal > 0 && mod.trackingCompleted === mod.trackingTotal) :
            completionFilter === "IN_PROGRESS" ? (mod.trackingCompleted > 0 && mod.trackingCompleted < mod.trackingTotal) :
            completionFilter === "NEW" ? (mod.trackingCompleted === 0) :
            true;

         return matchesSearch && matchesRoadmap && matchesType && matchesDifficulty && matchesCompletion;`;

if (content.includes(filterAnchor)) {
    content = content.replace(filterAnchor, filterReplacement);
} else {
    const tNoCrlf = filterAnchor.replace(/\r\n/g, '\n');
    const cNoCrlf = content.replace(/\r\n/g, '\n');
    content = cNoCrlf.replace(tNoCrlf, filterReplacement.replace(/\r\n/g, '\n')).replace(/\n/g, '\r\n');
}

// 3. Add UI row below Center toggle header
const uiAnchor = `            </div>
         </div>

         <div className="flex items-center gap-2 md:hidden mb-4">`;

const uiReplacement = `            </div>
            
            <div className="flex items-center justify-center gap-2 flex-wrap mt-4">
              {[
                { key: "ALL", label: "All", icon: "◈" },
                { key: "NEW", label: "New", icon: "✦" },
                { key: "IN_PROGRESS", label: "In Progress", icon: "⬡" },
                { key: "COMPLETED", label: "Completed", icon: "✓" },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setCompletionFilter(key as any)}
                  className={\`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-all \${
                    completionFilter === key
                      ? key === "COMPLETED"
                        ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                        : key === "IN_PROGRESS"
                        ? "bg-orange-500/15 text-orange-600 border-orange-500/30"
                        : key === "NEW"
                        ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
                        : "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                  }\`}
                >
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>
         </div>

         <div className="flex items-center gap-2 md:hidden mb-4">`;

if (content.includes(uiAnchor)) {
    content = content.replace(uiAnchor, uiReplacement);
} else {
    const tNoCrlf = uiAnchor.replace(/\r\n/g, '\n');
    const cNoCrlf = content.replace(/\r\n/g, '\n');
    content = cNoCrlf.replace(tNoCrlf, uiReplacement.replace(/\r\n/g, '\n')).replace(/\n/g, '\r\n');
}

fs.writeFileSync(file, content);
console.log("Cleanup filter complete!");

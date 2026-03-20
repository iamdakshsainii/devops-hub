import fs from "fs";

const filePath = "c:/my-stuff/devops-hub/src/app/admin/modules/[id]/page.tsx";
let content = fs.readFileSync(filePath, "utf-8");

// 1. Add states
const stateTarget = `const [form, setForm] = useState<ModuleForm>({`;
const stateReplacement = `const [form, setForm] = useState<ModuleForm>({\n    title: "", description: "", icon: "📦", tags: "", topics: [], resources: []\n  });\n  const [currentTag, setCurrentTag] = useState("");`;

if (content.includes(`title: "", description: "", icon: "📦", topics: [], resources: []`)) {
   content = content.replace(`title: "", description: "", icon: "📦", topics: [], resources: []`, `title: "", description: "", icon: "📦", tags: "", topics: [], resources: []`);
   content = content.replace(`  const [form, setForm] = useState<ModuleForm>({\n    title: "", description: "", icon: "📦", tags: "", topics: [], resources: []\n  });`, `  const [form, setForm] = useState<ModuleForm>({\n    title: "", description: "", icon: "📦", tags: "", topics: [], resources: []\n  });\n  const [currentTag, setCurrentTag] = useState("");`);
}

// 2. Add Badge import if not there or ensure Badge layout uses normal rendering
// 3. Replace Input Row
const inputTarget = `              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input value={form.tags || ""} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="e.g. docker, containers, devops" />
              </div>`;

const inputReplacement = `              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring">
                  {form.tags && form.tags.split(",").filter(Boolean).map((t, i) => (
                    <span key={i} className="flex items-center gap-1 text-[11px] py-1 px-2 rounded-full bg-primary/5 text-primary border border-primary/20">
                      #{t.trim()}
                      <button type="button" onClick={(e) => {
                        e.preventDefault();
                        const arr = form.tags.split(",").filter(Boolean);
                        arr.splice(i, 1);
                        setForm({ ...form, tags: arr.join(",") });
                      }} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                  <input
                    value={currentTag}
                    onChange={e => setCurrentTag(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (currentTag.trim()) {
                          const arr = form.tags ? form.tags.split(",").filter(Boolean) : [];
                          if (!arr.includes(currentTag.trim())) arr.push(currentTag.trim());
                          setForm({ ...form, tags: arr.join(",") });
                          setCurrentTag("");
                        }
                      }
                    }}
                    placeholder="Add tag + Enter..."
                    className="flex-1 bg-transparent border-none text-sm outline-none px-1 h-6"
                  />
                </div>
              </div>`;

if (content.includes(`placeholder="e.g. docker, containers, devops"`)) {
   content = content.replace(inputTarget, inputReplacement);
   console.log("SUCCESS: Replaced Input with Tags layout!");
}

fs.writeFileSync(filePath, content, "utf-8");
console.log("SUCCESS: Applied Edit Tags fixes!");

import fs from "fs";

const filePath = "c:/my-stuff/devops-hub/src/app/admin/resources/[id]/page.tsx";
let content = fs.readFileSync(filePath, "utf-8");

// 1. Add CurrentTag State
if (content.includes(`const [form, setForm] = useState({`)) {
   content = content.replace(`const [form, setForm] = useState({`, `const [currentTag, setCurrentTag] = useState("");\n  const [form, setForm] = useState({`);
}

// 2. Replace input row row with Pills Grid
const inputTarget = `<div className="space-y-1.5">
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <Input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="Docker, K8s" />
               </div>`;

const inputReplacement = `<div className="space-y-1.5 flex-1">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring">
                    {form.tags && form.tags.split(",").filter(Boolean).map((t, i) => (
                      <span key={i} className="flex items-center gap-1 text-[11px] py-1 px-2 rounded-full bg-primary/10 text-primary border border-primary/20">
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

if (content.includes(`placeholder="Docker, K8s"`)) {
   content = content.replace(inputTarget, inputReplacement);
   console.log("SUCCESS: Replaced Resources Input with Tags layout!");
}

fs.writeFileSync(filePath, content, "utf-8");
console.log("SUCCESS: Applied Edit Resources Tags fixes!");

import fs from "fs";

const filePath = "c:/my-stuff/devops-hub/src/app/events/dashboard/edit/[id]/client-edit-form.tsx";
let content = fs.readFileSync(filePath, "utf-8");

// 1. Add X icon import
if (!content.includes(`, X`)) {
   content = content.replace(`Loader2`, `Loader2, X`);
}

// 2. Add States
if (content.includes(`const [error, setError] = useState("");`)) {
   content = content.replace(`const [error, setError] = useState("");`, `const [error, setError] = useState("");\n  const [tags, setTags] = useState<string>(event.tags || "");\n  const [currentTag, setCurrentTag] = useState("");`);
}

// 3. Update Fetch PUT body to pass tags
if (content.includes(`imageUrls: getValue("imageUrls") || null,`)) {
   content = content.replace(`imageUrls: getValue("imageUrls") || null,`, `imageUrls: getValue("imageUrls") || null,\n          tags: tags,`);
}

// 4. Insert Layout above submit row 
const inputTarget = `<div className="space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Cover Image URL</label>
        <Input name="imageUrls" defaultValue={event.imageUrls || ""} placeholder="Optional — paste image URL" />
      </div>`;

const inputReplacement = `<div className="space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Cover Image URL</label>
        <Input name="imageUrls" defaultValue={event.imageUrls || ""} placeholder="Optional — paste image URL" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Tags</label>
        <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring">
          {tags && tags.split(",").filter(Boolean).map((t, i) => (
            <span key={i} className="flex items-center gap-1 text-[11px] py-1 px-2 rounded-full bg-primary/10 text-primary border border-primary/20">
              #{t.trim()}
              <button type="button" onClick={(e) => {
                e.preventDefault();
                const arr = tags.split(",").filter(Boolean);
                arr.splice(i, 1);
                setTags(arr.join(","));
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
                  const arr = tags ? tags.split(",").filter(Boolean) : [];
                  if (!arr.includes(currentTag.trim())) arr.push(currentTag.trim());
                  setTags(arr.join(","));
                  setCurrentTag("");
                }
              }
            }}
            placeholder="Add tag + Enter..."
            className="flex-1 bg-transparent border-none text-sm outline-none px-1 h-6"
          />
        </div>
      </div>`;

if (content.includes(`placeholder="Optional — paste image URL"`)) {
   content = content.replace(inputTarget, inputReplacement);
   console.log("SUCCESS: Replaced Events Input with Tags layout!");
}

fs.writeFileSync(filePath, content, "utf-8");
console.log("SUCCESS: Applied Edit Events Tags fixes!");

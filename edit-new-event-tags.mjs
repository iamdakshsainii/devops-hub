import fs from "fs";

const filePath = "c:/my-stuff/devops-hub/src/app/events/new/page.tsx";
let content = fs.readFileSync(filePath, "utf-8");

// Imports additions for icons
if (!content.includes(`, X`)) {
   content = content.replace(`Textarea } from`, `Textarea } from`); // Just confirming X is imported if needed, wait X isn't here!
   content = content.replace(`import { Input } from "@/components/ui/input";`, `import { Input } from "@/components/ui/input";\nimport { X } from "lucide-react";`);
}

// 1. Add States
if (content.includes(`const [files, setFiles] = useState<FileList | null>(null);`)) {
   content = content.replace(`const [files, setFiles] = useState<FileList | null>(null);`, `const [files, setFiles] = useState<FileList | null>(null);\n  const [tags, setTags] = useState<string>("");\n  const [currentTag, setCurrentTag] = useState("");`);
}

// 2. Append to payload setup
if (content.includes(`imageUrls: imageUrlsStr || undefined,`)) {
   content = content.replace(`imageUrls: imageUrlsStr || undefined,`, `imageUrls: imageUrlsStr || undefined,\n      tags: tags,`);
}

// 3. Insert Layout before Button row
const target = `<div className="space-y-1.5 pt-2">`;
const replacement = `<div className="space-y-1.5">
              <label className="text-sm font-semibold">Tags</label>
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
            </div>

            <div className="space-y-1.5 pt-2">`;

if (content.includes(`Posters / Cover Image (Up to 3)`)) {
   content = content.replace(target, replacement);
   console.log("SUCCESS: Patched Create Event with tags!");
}

fs.writeFileSync(filePath, content, "utf-8");
console.log("SUCCESS: Replaced New Event input triggers!");

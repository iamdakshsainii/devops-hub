import fs from "fs";
import path from "path";

const filePath = "c:/my-stuff/devops-hub/src/app/modules/modules-client.tsx";
let content = fs.readFileSync(filePath, "utf-8");

const target = `<CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">\\s*\\{mod.title\\}\\s*</CardTitle>\\s*</CardHeader>`;

const replacement = `<CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">
                                     {mod.title}
                                  </CardTitle>
                                  {mod.tags && (
                                     <div className="flex flex-wrap gap-1 mt-1.5">
                                        {mod.tags.split(",").filter(Boolean).map((t) => (
                                           <Badge key={t} variant="secondary" className="text-[10px] py-0 px-2 rounded-full font-medium bg-primary/5 text-primary/80 border border-primary/10">
                                              #{t.trim()}
                                           </Badge>
                                        ))}
                                     </div>
                                  )}
                               </CardHeader>`;

const regex = new RegExp(target, "m");

if (regex.test(content)) {
   const updated = content.replace(regex, replacement);
   fs.writeFileSync(filePath, updated, "utf-8");
   console.log("SUCCESS: Replaced CardTitle with Tags perfectly!");
} else {
   console.log("ERROR: Target content regex not matched inside file.");
}

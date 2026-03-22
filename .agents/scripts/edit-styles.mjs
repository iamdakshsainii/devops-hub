import fs from "fs";

const filePath = "c:/my-stuff/devops-hub/src/app/modules/modules-client.tsx";
let content = fs.readFileSync(filePath, "utf-8");

const targetClassStr = `className="text-[10px] py-0 px-2 rounded-full font-medium bg-primary/5 text-primary/80 border border-primary/10"`;
const replaceClassStr = `className="text-[10px] py-0.5 px-2.5 rounded-full font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:scale-105 shadow-sm transition-all duration-200"`;

if (content.includes(targetClassStr)) {
   content = content.replace(targetClassStr, replaceClassStr);
   content = content.replace(`mt-1.5`, `mt-2.5`); // Make spacing better
   fs.writeFileSync(filePath, content, "utf-8");
   console.log("SUCCESS: Patched Tags styled layout!");
} else {
   console.log("ERROR: Target style text with tags not found.");
}

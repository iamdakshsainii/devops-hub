import fs from 'fs';
const path = 'c:\\my-stuff\\devops-hub\\prisma\\schema.prisma';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);
const index = lines.findIndex((l, i) => l.trim() === "model ToolComparison {" && i > 398);
if (index !== -1) {
  lines.splice(index);
  fs.writeFileSync(path, lines.join("\n"), 'utf8');
  console.log("✅ Cleared duplicate from line " + index);
} else {
  console.log("❌ Line index not found.");
}

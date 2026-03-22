import fs from "fs";

const filePath = "c:/my-stuff/devops-hub/src/app/admin/modules/[id]/page.tsx";
let content = fs.readFileSync(filePath, "utf-8");

const target = `status: data\\.status \\|\\| "PENDING",`;
const replacement = `status: data.status || "PENDING",\n            tags: data.tags || "",`;

if (content.includes('status: data.status || "PENDING",')) {
   const updated = content.replace('status: data.status || "PENDING",', 'status: data.status || "PENDING",\n            tags: data.tags || "",');
   fs.writeFileSync(filePath, updated, "utf-8");
   console.log("SUCCESS: Patched Admin module reader!");
} else {
   console.log("ERROR: Could not find target status Row.");
}

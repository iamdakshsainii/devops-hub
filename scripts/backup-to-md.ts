import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const BACKUP_DIR = path.join(process.cwd(), "content", "backups");

async function main() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const modules = await prisma.roadmapStep.findMany({
    where: { roadmapId: null, status: { not: "DELETED" } },
    include: { topics: { include: { subtopics: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
  });

  console.log(`Backing up ${modules.length} modules to "${BACKUP_DIR}"...`);

  for (const module of modules) {
    let md = `# ${module.title}\n\n`;
    if (module.description) md += `${module.description}\n\n`;

    for (const t of module.topics) {
      md += `## ${t.title}\n\n`;
      if (t.content) md += `${t.content}\n\n`;
      
      for (const s of t.subtopics) {
        md += `### ${s.title}\n\n${s.content}\n\n`;
      }
    }

    const filename = `${module.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
    fs.writeFileSync(path.join(BACKUP_DIR, filename), md);
    console.log(`  -> Backed up "${module.title}" to ${filename}`);
  }

  console.log("All modules backed up successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const BACKUP_DIR = path.join(process.cwd(), "content", "backups");

async function main() {
  const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith(".md"));
  console.log(`Master re-architecting ${files.length} modules from backups...`);

  for (const filename of files) {
    const fullPath = path.join(BACKUP_DIR, filename);
    const rawContent = fs.readFileSync(fullPath, "utf-8");
    const moduleTitleMatch = rawContent.match(/^# (.*)/);
    const moduleTitle = moduleTitleMatch ? moduleTitleMatch[1].trim() : filename.replace(".md", "");

    console.log(`\n🏗️  Re-architecting "${moduleTitle}"...`);

    // Extract all sections (###)
    const sections: any[] = [];
    const lines = rawContent.split("\n");
    let currentSection: any = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("### ")) {
        currentSection = { title: trimmed.replace(/^###\s*/, ""), content: "" };
        sections.push(currentSection);
      } else if (trimmed.startsWith("## ")) {
        // Treat old ## headers as plain sections now to regroup them
        currentSection = { title: trimmed.replace(/^##\s*/, ""), content: "" };
        sections.push(currentSection);
      } else if (currentSection) {
        currentSection.content += line + "\n";
      }
    }

    if (sections.length < 5) {
       console.log(`  -> Too small to restructure. Skipping logic but will sync to db.`);
    }

    // Goal: 9 to 10 Chapters
    const targetChapters = Math.min(10, Math.max(5, Math.ceil(sections.length / 5)));
    const sectionsPerChapter = Math.ceil(sections.length / targetChapters);

    const newTopics: any[] = [];
    for (let i = 0; i < targetChapters; i++) {
        const start = i * sectionsPerChapter;
        const end = Math.min(start + sectionsPerChapter, sections.length);
        const slice = sections.slice(start, end);
        if (slice.length === 0) continue;

        // Create a sensible chapter title
        const chapterTitle = slice[0].title;
        newTopics.push({
           title: chapterTitle,
           content: "", // Minimal intro, mostly subtopics
           subtopics: slice
        });
    }

    console.log(`  -> Successfully grouped into ${newTopics.length} navigation-grade chapters.`);

    // 1. Update the local MD file in backups with ## and ### headers properly
    let newMd = `# ${moduleTitle}\n\n`;
    for (const nt of newTopics) {
      newMd += `## ${nt.title}\n\n`;
      for (const s of nt.subtopics) {
         newMd += `### ${s.title}\n\n${s.content.trim()}\n\n`;
      }
    }
    fs.writeFileSync(fullPath, newMd);

    // 2. Sync to Database
    const step = await prisma.roadmapStep.findFirst({ where: { title: moduleTitle } });
    if (step) {
      await prisma.$transaction(async (tx) => {
        await tx.roadmapTopic.deleteMany({ where: { stepId: step.id } });
        for (let i = 0; i < newTopics.length; i++) {
          const nt = newTopics[i];
          await tx.roadmapTopic.create({
            data: {
              stepId: step.id,
              title: nt.title.trim(),
              content: nt.content.trim(),
              order: i,
              subtopics: {
                create: nt.subtopics.map((s: any, si: number) => ({
                  title: s.title.trim(),
                  content: s.content.trim(),
                  order: si,
                })),
              },
            },
          });
        }
      });
      console.log(`  -> Database Synced!`);
    } else {
      console.log(`  -> Module not found in db, skipping sync.`);
    }
  }

  console.log("\nMaster Re-architecture Complete! 🏆");
}

main().catch(console.error).finally(() => prisma.$disconnect());

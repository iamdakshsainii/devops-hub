import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const BACKUP_DIR = path.join(process.cwd(), "content", "backups");

async function main() {
  const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith(".md"));
  console.log(`🚀 Safe Master Restructure for ${files.length} modules...`);

  for (const filename of files) {
    const rawContent = fs.readFileSync(path.join(BACKUP_DIR, filename), "utf-8");
    const moduleTitleMatch = rawContent.match(/^# (.*)/);
    const moduleTitle = moduleTitleMatch ? moduleTitleMatch[1].trim() : filename.replace(".md", "");

    console.log(`\n--- Working on "${moduleTitle}" ---`);

    // Parse all sections
    const sections: any[] = [];
    const lines = rawContent.split("\n");
    let currentSection: any = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("### ")) {
        currentSection = { title: trimmed.replace(/^###\s*/, ""), content: "" };
        sections.push(currentSection);
      } else if (trimmed.startsWith("## ")) {
        currentSection = { title: trimmed.replace(/^##\s*/, ""), content: "" };
        sections.push(currentSection);
      } else if (currentSection) {
        currentSection.content += line + "\n";
      }
    }

    if (sections.length < 3) continue;

    // Grouping logic (Aim for 9-10 Chapters)
    const targetChapters = Math.min(10, Math.max(5, Math.ceil(sections.length / 5)));
    const sectionsPerChapter = Math.ceil(sections.length / targetChapters);

    const step = await prisma.roadmapStep.findFirst({ where: { title: moduleTitle } });
    if (step) {
      try {
          await prisma.roadmapTopic.deleteMany({ where: { stepId: step.id } });
          for (let i = 0; i < targetChapters; i++) {
            const start = i * sectionsPerChapter;
            const end = Math.min(start + sectionsPerChapter, sections.length);
            const slice = sections.slice(start, end);
            if (slice.length === 0) continue;

            const nt = {
               title: slice[0].title,
               content: "",
               subtopics: slice
            };

            await prisma.roadmapTopic.create({
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
          console.log(`  -> Final save success!`);
      } catch (err) {
          console.error(`  -> Failed for "${moduleTitle}":`, err);
      }
    }
  }

  console.log("\nSafe Re-architecture Complete! 🎉");
}

main().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const BACKUP_DIR = path.join(process.cwd(), "content", "backups");

function cleanTitle(t: string) {
    return t.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "").trim();
}

async function main() {
  const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith(".md"));
  const allModules = await prisma.roadmapStep.findMany({ where: { roadmapId: null, status: { not: "DELETED" } } });

  console.log(`💡 Fuzzy matching ${files.length} backups against ${allModules.length} database modules...`);

  for (const filename of files) {
    const rawContent = fs.readFileSync(path.join(BACKUP_DIR, filename), "utf-8");
    const moduleTitleMatch = rawContent.match(/^# (.*)/);
    const rawFileTitle = moduleTitleMatch ? moduleTitleMatch[1].trim() : filename.replace(".md", "");
    const fileTitleKey = cleanTitle(rawFileTitle);

    const match = allModules.find(m => cleanTitle(m.title) === fileTitleKey);

    if (!match) {
        console.log(`❌ Could not match "${rawFileTitle}" to any database entry.`);
        continue;
    }

    console.log(`\n💎 Restructuring "${match.title}" (Matched from "${rawFileTitle}")...`);

    // Extract all sections to re-group
    const sections: any[] = [];
    const lines = rawContent.split("\n");
    let currentSection: any = null;

    for (const line of lines) {
      if (line.trim().startsWith("### ") || line.trim().startsWith("## ")) {
        const t = line.trim().replace(/^###?\s*/, "").replace(/^##\s*/, "");
        currentSection = { title: t, content: "" };
        sections.push(currentSection);
      } else if (currentSection) {
        currentSection.content += line + "\n";
      }
    }

    if (sections.length < 5) {
       console.log(`  -> Not enough sections to re-bucket to 10. Syncing as is.`);
    }

    // Bucket into exactly 10 chapters
    const targetChapters = Math.min(10, Math.max(5, Math.ceil(sections.length / 4.5)));
    const sectionsPerChapter = Math.ceil(sections.length / targetChapters);

    const newTopics: any[] = [];
    for (let i = 0; i < targetChapters; i++) {
        const start = i * sectionsPerChapter;
        const end = Math.min(start + sectionsPerChapter, sections.length);
        const slice = sections.slice(start, end);
        if (slice.length === 0) continue;

        newTopics.push({
           title: slice[0].title,
           content: "",
           subtopics: slice
        });
    }

    try {
        // Safe Update (non-transactional for the whole module to avoid P2028)
        await prisma.roadmapTopic.deleteMany({ where: { stepId: match.id } });
        for (let i = 0; i < newTopics.length; i++) {
          const nt = newTopics[i];
          await prisma.roadmapTopic.create({
            data: {
              stepId: match.id,
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
        console.log(`  -> ✅ Re-structured & Database Updated!`);
    } catch (err) {
        console.error(`  -> Failed:`, err);
    }
  }

  console.log("\nFuzzy Restructure Complete! 🏆✨");
}

main().catch(console.error).finally(() => prisma.$disconnect());

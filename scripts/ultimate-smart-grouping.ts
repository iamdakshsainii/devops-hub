import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const modules = await prisma.roadmapStep.findMany({
    where: { roadmapId: null, status: { not: "DELETED" } },
    include: { topics: { orderBy: { order: "asc" } } },
  });

  console.log(`Smart Grouping ${modules.length} modules for the Ultimate Sidebar...`);

  for (const module of modules) {
    if (module.topics.length < 10) continue;

    console.log(`\n--- Optimizing "${module.title}" ---`);

    let currentChapter: any = null;
    const chapters: any[] = [];

    for (const t of module.topics) {
      const title = t.title.trim();
      const content = t.content || "";
      
      // Is this a major Chapter? (Starts with a number or looks like a major title)
      const isChapter = /^\d+/.test(title);
      
      if (isChapter || !currentChapter) {
        currentChapter = { title: title, content: content, subtopics: [] };
        chapters.push(currentChapter);
      } else {
        // This is a detail, make it a SUBTOPIC of the previous chapter
        currentChapter.subtopics.push({ title: title, content: content });
      }
    }

    if (chapters.length > 0) {
      console.log(`  -> Collapsed ${module.topics.length} items into ${chapters.length} Chapters.`);
      
      try {
          await prisma.roadmapTopic.deleteMany({ where: { stepId: module.id } });
          for (let i = 0; i < chapters.length; i++) {
            const ch = chapters[i];
            await prisma.roadmapTopic.create({
              data: {
                stepId: module.id,
                title: ch.title,
                content: ch.content.trim(),
                order: i,
                subtopics: {
                  create: ch.subtopics.map((s: any, si: number) => ({
                    title: s.title,
                    content: s.content.trim(),
                    order: si,
                  })),
                },
              },
            });
          }
          console.log(`  -> Final Structure Locked for "${module.title}"`);
      } catch (err) {
          console.error(`  -> Failed:`, err);
      }
    }
  }

  console.log("\nUltimate Sidebar Smart-Grouping Complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

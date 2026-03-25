import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const modules = await prisma.roadmapStep.findMany({
    where: { roadmapId: null, status: { not: "DELETED" } },
    include: { topics: { orderBy: { order: "asc" } } },
  });

  console.log(`Found ${modules.length} modules to clean up.`);

  for (const module of modules) {
    if (module.topics.length < 10) {
      console.log(`Skip "${module.title}": already clean (${module.topics.length} topics).`);
      continue;
    }

    console.log(`Cleaning up "${module.title}" (current: ${module.topics.length} topics)...`);

    // Stitch together all topic contents
    let fullMarkdown = `# ${module.title}\n\n`;
    if (module.description) fullMarkdown += `${module.description}\n\n`;
    
    for (const t of module.topics) {
      // Re-insert headers if missing or just use existing ones
      if (!t.title.includes("##") && !t.title.includes("###")) {
         // Fallback if topics were flattened but headers removed
         fullMarkdown += `### ${t.title}\n\n${t.content || ""}\n\n`;
      } else {
         fullMarkdown += `${t.content || ""}\n\n`;
      }
    }

    // Now re-parse with H2/H3 logic
    const lines = fullMarkdown.split("\n");
    let currentTopic: any = null;
    let currentSubtopic: any = null;
    const newTopics: any[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) {
        currentTopic = { title: trimmed.replace(/^##\s*/, "").trim(), content: "", subtopics: [] };
        newTopics.push(currentTopic);
        currentSubtopic = null;
      } else if (trimmed.startsWith("### ")) {
        if (!currentTopic) {
          currentTopic = { title: "Introduction", content: "", subtopics: [] };
          newTopics.push(currentTopic);
        }
        currentSubtopic = { title: trimmed.replace(/^###\s*/, "").trim(), content: "" };
        currentTopic.subtopics.push(currentSubtopic);
      } else if (currentSubtopic) {
        currentSubtopic.content += line + "\n";
      } else if (currentTopic) {
        currentTopic.content += line + "\n";
      }
    }

    if (newTopics.length > 0) {
      console.log(`  -> New structure has ${newTopics.length} topics. Saving...`);
      await prisma.$transaction(async (tx) => {
        await tx.roadmapTopic.deleteMany({ where: { stepId: module.id } });
        for (let i = 0; i < newTopics.length; i++) {
          const nt = newTopics[i];
          await tx.roadmapTopic.create({
            data: {
              stepId: module.id,
              title: nt.title,
              content: nt.content.trim(),
              order: i,
              subtopics: {
                create: nt.subtopics.map((s: any, si: number) => ({
                  title: s.title,
                  content: s.content.trim(),
                  order: si,
                })),
              },
            },
          });
        }
      });
    }
  }

  console.log("Cleanup complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const modules = await prisma.roadmapStep.findMany({
    where: { roadmapId: null, status: { not: "DELETED" } },
    include: { topics: { orderBy: { order: "asc" } } },
  });

  console.log(`Re-structuring ${modules.length} modules for Premium UI...`);

  for (const module of modules) {
    console.log(`Processing "${module.title}"...`);

    // Combine current content to re-parse with H2/H3 logic
    let fullMarkdown = module.topics.map(t => {
        let text = t.content || "";
        // If it's a topic from a previous failed split, it might have H3s but not H2
        if (!text.includes("## ") && t.title) {
            return `## ${t.title}\n\n${text}`;
        }
        return text;
    }).join("\n\n");

    const lines = fullMarkdown.split("\n");
    let currentTopic: any = null;
    let currentSubtopic: any = null;
    const finalTopics: any[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) {
        currentTopic = { title: trimmed.replace(/^##\s*/, ""), content: "", subtopics: [] };
        finalTopics.push(currentTopic);
        currentSubtopic = null;
      } else if (trimmed.startsWith("### ")) {
        if (!currentTopic) {
          currentTopic = { title: "Introduction", content: "", subtopics: [] };
          finalTopics.push(currentTopic);
        }
        currentSubtopic = { title: trimmed.replace(/^###\s*/, ""), content: "" };
        currentTopic.subtopics.push(currentSubtopic);
      } else if (currentSubtopic) {
        currentSubtopic.content += line + "\n";
      } else if (currentTopic) {
        currentTopic.content += line + "\n";
      }
    }

    if (finalTopics.length > 0) {
      console.log(`  -> Final Structure: ${finalTopics.length} Topics, ${finalTopics.reduce((acc, t) => acc + t.subtopics.length, 0)} Subtopics.`);
      await prisma.$transaction(async (tx) => {
        await tx.roadmapTopic.deleteMany({ where: { stepId: module.id } });
        for (let i = 0; i < finalTopics.length; i++) {
          const t = finalTopics[i];
          await tx.roadmapTopic.create({
            data: {
              stepId: module.id,
              title: t.title.trim(),
              content: t.content.trim(),
              order: i,
              subtopics: {
                create: t.subtopics.map((s: any, si: number) => ({
                  title: s.title.trim(),
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

  console.log("Premium Restructure complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

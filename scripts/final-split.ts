import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const modules = await prisma.roadmapStep.findMany({
    where: { roadmapId: null, status: { not: "DELETED" } },
    include: { topics: { orderBy: { order: "asc" } } },
  });

  console.log(`Analyzing ${modules.length} modules for final reconstruction...`);

  for (const module of modules) {
    if (module.topics.length === 0) continue;

    console.log(`Reconstructing "${module.title}"...`);

    // Combine all current content into one string
    let fullMarkdown = module.topics.map(t => {
        let text = t.content || "";
        if (!t.title.includes("##") && !t.title.includes("###")) {
             return `## ${t.title}\n\n${text}`;
        }
        return text;
    }).join("\n\n");

    // NEW LOGIC: Only split by ## (H2). Keep ### (H3) as part of the content.
    const lines = fullMarkdown.split("\n");
    let currentTopic: any = null;
    const finalTopics: any[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) {
        currentTopic = { title: trimmed.replace(/^##\s*/, ""), content: "" };
        finalTopics.push(currentTopic);
      } else if (currentTopic) {
        currentTopic.content += line + "\n";
      } else if (trimmed.length > 0 && !trimmed.startsWith("# ")) {
        // Fallback for intro text before first ##
        currentTopic = { title: "Introduction", content: line + "\n" };
        finalTopics.push(currentTopic);
      }
    }

    if (finalTopics.length > 0) {
      console.log(`  -> Splitting into ${finalTopics.length} sidebar topics.`);
      await prisma.$transaction(async (tx) => {
        await tx.roadmapTopic.deleteMany({ where: { stepId: module.id } });
        for (let i = 0; i < finalTopics.length; i++) {
          const nt = finalTopics[i];
          await tx.roadmapTopic.create({
            data: {
              stepId: module.id,
              title: nt.title.trim(),
              content: nt.content.trim(),
              order: i,
            },
          });
        }
      });
    }
  }

  console.log("Final Reconstruction complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

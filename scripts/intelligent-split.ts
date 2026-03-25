import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const modules = await prisma.roadmapStep.findMany({
    where: { roadmapId: null, status: { not: "DELETED" } },
    include: { topics: { orderBy: { order: "asc" } } },
  });

  console.log(`Analyzing ${modules.length} modules for intelligent splitting...`);

  for (const module of modules) {
    if (module.topics.length !== 1) continue;

    const mainTopic = module.topics[0];
    const content = mainTopic.content || "";
    
    // Count ### headers
    const headers = content.split("\n").filter(l => l.trim().startsWith("### "));
    
    if (headers.length < 5) {
       console.log(`Skip "${module.title}": only ${headers.length} sub-sections.`);
       continue;
    }

    console.log(`Splitting heavy module "${module.title}" with ${headers.length} sections...`);

    // Split logic: Turn every ### into a ##, and then my parser will split by ##
    const processedContent = content.replace(/\n### /g, "\n## ");
    
    const lines = processedContent.split("\n");
    let currentTopic: any = null;
    const finalTopics: any[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) {
        currentTopic = { title: trimmed.replace(/^##\s*/, ""), content: "" };
        finalTopics.push(currentTopic);
      } else if (currentTopic) {
        currentTopic.content += line + "\n";
      } else if (trimmed.length > 0) {
        if (!currentTopic) {
           currentTopic = { title: "Introduction", content: "" };
           finalTopics.push(currentTopic);
        }
        currentTopic.content += line + "\n";
      }
    }

    if (finalTopics.length > 0) {
      console.log(`  -> Restoring ${finalTopics.length} navigation steps.`);
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

  console.log("Intelligent splitting complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const modules = await prisma.roadmapStep.findMany({
    where: { roadmapId: null, status: { not: "DELETED" } },
    include: { topics: { orderBy: { order: "asc" } } },
  });

  console.log(`Analyzing ${modules.length} modules...`);

  for (const module of modules) {
    if (module.topics.length !== 1) continue;

    const mainTopic = module.topics[0];
    const content = mainTopic.content || "";
    
    // Check for H3 headings to split by
    const segments = content.split(/\n### /);
    if (segments.length < 3) {
      console.log(`Skip "${module.title}": only ${segments.length} segments.`);
      continue;
    }

    console.log(`Splitting "${module.title}" into ${segments.length} topics...`);

    const newTopics = segments.map((seg, i) => {
        const lines = seg.trim().split("\n");
        let title = "More Content";
        let body = seg;
        
        if (i === 0) {
            title = mainTopic.title;
            body = seg;
        } else {
            title = lines[0].trim();
            body = lines.slice(1).join("\n").trim();
        }
        
        return { title, content: body };
    });

    // Update ONE module at a time without a big transaction if needed, or small transactions
    try {
        await prisma.roadmapTopic.deleteMany({ where: { stepId: module.id } });
        for (let i = 0; i < newTopics.length; i++) {
          const nt = newTopics[i];
          await prisma.roadmapTopic.create({
            data: {
              stepId: module.id,
              title: nt.title,
              content: nt.content,
              order: i,
            },
          });
        }
        console.log(`  -> Success!`);
    } catch (e) {
        console.error(`  -> Failed for "${module.title}":`, e);
    }
  }

  console.log("Safe split complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

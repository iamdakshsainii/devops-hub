import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const modules = await prisma.roadmapStep.findMany({
    where: { roadmapId: null, status: { not: "DELETED" } },
    include: { topics: { include: { subtopics: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
  });

  console.log(`Re-balancing ${modules.length} modules for multi-step navigation...`);

  for (const module of modules) {
    if (module.topics.length > 5) {
       console.log(`Skip "${module.title}": already have ${module.topics.length} steps.`);
       continue;
    }

    console.log(`\n--- Splitting "${module.title}" ---`);

    // Combine all subtopics from ALL existing topics
    const allUnits: any[] = [];
    for (const t of module.topics) {
       if (t.content && t.content.trim().length > 0) {
          allUnits.push({ title: t.title, content: t.content });
       }
       for (const s of t.subtopics) {
          allUnits.push({ title: s.title, content: s.content });
       }
    }

    if (allUnits.length < 5) continue;

    // Split every ~6-7 units into a Sidebar Topic
    const splitCount = Math.ceil(allUnits.length / 7);
    const unitsPerTopic = Math.ceil(allUnits.length / splitCount);

    const newTopics: any[] = [];
    for (let i = 0; i < splitCount; i++) {
        const start = i * unitsPerTopic;
        const end = Math.min(start + unitsPerTopic, allUnits.length);
        const slice = allUnits.slice(start, end);
        if (slice.length === 0) continue;

        // Use the first unit title as the Topic Title
        newTopics.push({
           title: slice[0].title,
           content: "",
           subtopics: slice
        });
    }

    if (newTopics.length > 0) {
      console.log(`  -> Final Structure: ${newTopics.length} Navigation Steps.`);
      await prisma.$transaction(async (tx) => {
        await tx.roadmapTopic.deleteMany({ where: { stepId: module.id } });
        for (let i = 0; i < newTopics.length; i++) {
          const nt = newTopics[i];
          await tx.roadmapTopic.create({
            data: {
              stepId: module.id,
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
    }
  }

  console.log("\nNavigation Balance Complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const modules = await prisma.roadmapStep.findMany({
    where: { roadmapId: null, status: { not: "DELETED" } },
    include: { topics: { include: { subtopics: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
  });

  console.log(`Found ${modules.length} modules to flatten.`);

  for (const module of modules) {
    console.log(`Flattening "${module.title}"...`);

    await prisma.$transaction(async (tx) => {
      // For each topic, if it has subtopics, merge them into the content
      for (const t of module.topics) {
        if (t.subtopics.length > 0) {
          let mergedContent = t.content || "";
          
          for (const s of t.subtopics) {
            mergedContent += `\n\n### ${s.title}\n\n${s.content}\n`;
          }

          // Update the topic and delete the subtopics
          await tx.roadmapTopic.update({
            where: { id: t.id },
            data: {
              content: mergedContent.trim(),
              subtopics: { deleteMany: {} }
            }
          });
        }
      }
    });
  }

  console.log("Flattening complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

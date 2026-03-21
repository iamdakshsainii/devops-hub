const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const step = await prisma.roadmapStep.findUnique({
    where: { id: "cmmyhmsrr000112slj49wdbg7" },
    include: {
      topics: {
        include: { subtopics: true }
      }
    }
  });

  if (!step) {
    console.log("NOT FOUND");
    return;
  }

  console.log(`Step Title: ${step.title}`);
  for (const topic of step.topics) {
    console.log(`\n=== Topic: ${topic.title} (Content Length: ${topic.content?.length ?? 0}) ===`);
    for (const sub of topic.subtopics) {
      console.log(`  - Subtopic: ${sub.title}`);
      console.log(`    Content: ${(sub.content || "").substring(0, 80).replace(/\n/g, " ")}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

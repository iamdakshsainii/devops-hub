const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const id = "cmmyhmsrr000112slj49wdbg7";
  const step = await prisma.roadmapStep.findUnique({
    where: { id },
    include: { topics: { include: { subtopics: true } } }
  });

  if (!step) { console.log("NOT FOUND"); return; }

  const t = step.topics[0]; // First topic
  console.log(`Topic: ${t.title}`);
  for (let i=0; i < Math.min(t.subtopics.length, 3); i++) {
    const sub = t.subtopics[i];
    console.log(`[Subtopic ${i+1}] ${sub.title} -> Content Length: ${(sub.content || "").length}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

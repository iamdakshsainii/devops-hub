import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const step = await prisma.roadmapStep.findFirst({
    where: { title: "Build and Package management" },
    include: { topics: { include: { subtopics: true } } }
  });

  if (!step) { console.log("Not found"); return; }
  console.log(`Step: ${step.title}`);
  for (const t of step.topics) {
    console.log(`TOPIC: [${t.title}] (${t.subtopics.length} subtopics)`);
    for (const s of t.subtopics) {
        console.log(`   SUB: [${s.title}]`);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());

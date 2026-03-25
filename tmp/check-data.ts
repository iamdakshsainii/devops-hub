import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const step = await prisma.roadmapStep.findFirst({
    where: { title: "Shell Scripting" },
    include: { topics: { include: { subtopics: true } } }
  });

  if (!step) { console.log("Not found"); return; }
  console.log(`Step: ${step.title}`);
  for (const t of step.topics) {
    console.log(`TOPIC: [${t.title}] (${t.subtopics.length} subs) content: ${t.content?.length || 0} chars`);
    for (const s of t.subtopics) {
        console.log(`   SUB: [${s.title}] content: ${s.content?.length || 0} chars`);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());

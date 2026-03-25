import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const step = await prisma.roadmapStep.findFirst({
    where: { title: "Build and Package management" },
    include: { topics: { include: { subtopics: true } } }
  });

  if (!step) {
    console.log("Not found");
    return;
  }

  console.log(`Step: ${step.title} (${step.id})`);
  console.log(`Topics count: ${step.topics.length}`);
  
  step.topics.forEach((t, i) => {
    console.log(`${i+1}. ${t.title} (${t.subtopics.length} subs)`);
    t.subtopics.forEach(s => {
       console.log(`   - ${s.title}`);
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());

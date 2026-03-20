const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roadmaps = await prisma.roadmap.findMany({
    select: { id: true, title: true }
  });
  console.log(JSON.stringify(roadmaps, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.roadmapStep.deleteMany({
    where: { status: "DELETED" }
  });
  console.log(`Permanently deleted ${result.count} soft-deleted items from the database.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

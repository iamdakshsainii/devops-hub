import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const allAttached = await prisma.roadmapStepModule.findMany({
    where: { isOptional: true }
  });
  
  console.log("Optional modules in DB:", JSON.stringify(allAttached, null, 2));
}

main().finally(() => prisma.$disconnect())

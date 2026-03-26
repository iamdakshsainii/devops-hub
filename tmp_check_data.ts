import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const stepId = 'cmmyhmu96000612sl7w82zps7' // From user screenshot URL
  
  const step = await prisma.roadmapStep.findUnique({
    where: { id: stepId },
    include: {
      attachedModules: true
    }
  });
  
  console.log("Attached modules result:", JSON.stringify(step?.attachedModules, null, 2));
}

main().finally(() => prisma.$disconnect())

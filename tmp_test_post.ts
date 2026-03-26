import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const stepId = 'cmmyhmwat000c12sle6n5zp1u' // From user screenshot
  const moduleId = 'cmmx1x4id0000lrqwn7qsq0ry' // Sample module
  
  try {
    const attachment = await prisma.roadmapStepModule.create({
      data: {
        stepId,
        moduleId,
        isOptional: false,
        order: 0
      }
    });
    console.log("Attached successfully:", attachment);
  } catch (e: any) {
    if (e.code === 'P2002') console.log("Already exists");
    else console.error(e);
  }
}

main().finally(() => prisma.$disconnect())

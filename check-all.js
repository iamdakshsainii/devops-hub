const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const s = await prisma.roadmapStep.findUnique({
      where: { id: "cmn3l0sbo000cqjg04i47yjkj" }
    });
    const t = await prisma.topic.findUnique({
      where: { id: "cmn3l0sbo000cqjg04i47yjkj" }
    });
    const sub = await prisma.subtopic.findUnique({
      where: { id: "cmn3l0sbo000cqjg04i47yjkj" }
    });
    
    console.log("RoadmapStep:", s?.title);
    console.log("Topic:", t?.title);
    console.log("Subtopic:", sub?.title);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const s = await prisma.roadmapStep.findUnique({
      where: { id: "cmn3l0sbo000cqjg04i47yjkj" },
      include: { resources: true }
    });
    console.log("Step Title:", s?.title);
    console.log("Resources Count:", s?.resources ? s.resources.length : 0);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();

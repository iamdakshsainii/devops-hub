import { prisma } from "./src/lib/prisma";

async function run() {
  const s = await prisma.roadmapStep.findUnique({
    where: { id: "cmn3l0sbo000cqjg04i47yjkj" },
    include: { resources: true }
  });
  console.log("Step Title:", s?.title);
  console.log("Resources Count:", s?.resources.length);
  console.log("Resources:", s?.resources);
}

run();

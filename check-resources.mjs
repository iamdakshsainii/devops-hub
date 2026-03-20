import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const global = await prisma.resource.findMany({ select: { id: true, title: true, description: true } });
  const roadmap = await prisma.roadmapResource.findMany({ select: { id: true, title: true, description: true } });

  console.log("=== Global Resources ===");
  console.log(JSON.stringify(global, null, 2));

  console.log("\n=== Roadmap Resources ===");
  console.log(JSON.stringify(roadmap, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

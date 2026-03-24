import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
    try {
        const id = "devops-arch-001";
        const roadmap = await prisma.roadmap.findUnique({
          where: { id },
          include: {
            steps: {
              where: { status: { not: "DELETED" } },
              orderBy: { order: "asc" },
              include: {
                topics: { orderBy: { order: "asc" } },
                resources: { orderBy: { order: "asc" } },
              },
            },
          },
        });
        console.log("Found roadmap:", roadmap ? roadmap.title : "null");
    } catch (e) {
        console.error("Prisma query failed:", e);
    }
}

run();

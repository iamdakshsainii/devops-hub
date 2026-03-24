import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
    try {
        const id = "cmmyhn01b000o12sl2tnjb64l";
        const step = await prisma.roadmapStep.findUnique({
          where: { id }
        });
        console.log("Found Step:", step ? `${step.title} (${step.id})` : "NULL - NOT FOUND");
    } catch (e) {
        console.error("Prisma query failed:", e);
    }
}

run();

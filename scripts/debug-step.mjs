import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
    const stepId = "cmmyhn01b000o12sl2tnjb64l";
    let output = `Checking Step ID: ${stepId}...\n`;

    try {
        const step = await prisma.roadmapStep.findUnique({
            where: { id: stepId },
        });

        if (step) {
            output += "✅ Step found!\n";
            output += `Title: ${step.title}\n`;
            output += `Status: ${step.status}\n`;
            output += `RoadmapId: ${step.roadmapId}\n`;
        } else {
            output += "❌ Step NOT found in database.\n";
            const allSteps = await prisma.roadmapStep.findMany({
                take: 5,
                select: { id: true, title: true, status: true }
            });
            allSteps.forEach(s => { output += `- [${s.status}] (${s.id}) ${s.title}\n`; });
        }
    } catch (err) {
        output += `Prisma Error: ${err.message}\n`;
    } finally {
        await prisma.$disconnect();
    }

    fs.writeFileSync("scripts/output.txt", output);
}

main().catch(console.error);

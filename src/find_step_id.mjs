import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
    try {
        const step = await prisma.roadmapStep.findFirst({
            where: { title: "Terraform" }
        });
        if (step) {
            console.log("Terraform Step ID:", step.id, "Tags:", step.tags);
        } else {
            console.log("Could not find Terraform step.");
        }
    } catch (e) {
        console.error(e);
    }
}

run();

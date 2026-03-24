import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
    const resources = await prisma.resource.findMany({
        where: {
            tags: { contains: "terraform", mode: "insensitive" }
        }
    });

    console.log("Matched resources:", resources.map(r => ({ title: r.title, status: r.status, tags: r.tags })));
    process.exit(0);
}

run();

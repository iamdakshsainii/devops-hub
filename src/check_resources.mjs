import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
    try {
        const stats = await prisma.resource.count({ where: { status: "PUBLISHED" } });
        const res = await prisma.resource.findMany({ take: 3 });
        console.log("Stats PUBLISHED:", stats);
        console.log("Top 3:", res.map(r => ({ title: r.title, status: r.status, tags: r.tags })));
    } catch (e) {
        console.error("Prisma error:", e);
    }
}

run();

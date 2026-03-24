import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
    try {
        const title = "Shell Scripting by mPrashant";
        const items = await prisma.resource.findMany({
          where: { title }
        });
        console.log(`Found ${items.length} items with title "${title}":`);
        for (const i of items) {
            console.log(`- ID: ${i.id}, Title: ${i.title}, Type: ${i.type}`);
        }
    } catch (e) {
        console.error("Prisma query failed:", e);
    }
}

run();

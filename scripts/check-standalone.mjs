import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    // Check for dummy General Modules roadmap
    const dummyRoadmap = await prisma.roadmap.findFirst({
        where: { title: "General Modules" },
        include: { steps: { select: { id: true, title: true } } }
    });

    if (!dummyRoadmap) {
        console.log("✅ No dummy 'General Modules' roadmap found — all clean.");
    } else {
        console.log(`⚠️  Found dummy roadmap: "${dummyRoadmap.title}" (${dummyRoadmap.id})`);
        console.log(`   ${dummyRoadmap.steps.length} modules attached to it:`);
        dummyRoadmap.steps.forEach(s => console.log(`   - [${s.id}] ${s.title}`));

        // Fix: set roadmapId to null on all these modules → makes them truly standalone
        if (dummyRoadmap.steps.length > 0) {
            await prisma.roadmapStep.updateMany({
                where: { roadmapId: dummyRoadmap.id },
                data: { roadmapId: null }
            });
            console.log(`\n✅ Fixed — ${dummyRoadmap.steps.length} module(s) are now standalone (roadmapId = null)`);
        }

        // Delete the dummy roadmap
        await prisma.roadmap.delete({ where: { id: dummyRoadmap.id } });
        console.log(`✅ Deleted dummy roadmap.`);
    }

    // Show all current roadmaps
    const roadmaps = await prisma.roadmap.findMany({
        where: { status: { not: "DELETED" } },
        select: { id: true, title: true, status: true, _count: { select: { steps: true } } }
    });
    console.log(`\n📋 Current roadmaps (${roadmaps.length}):`);
    roadmaps.forEach(r => console.log(`   [${r.status}] ${r.title} — ${r._count.steps} steps`));

    // Show standalone modules
    const standalone = await prisma.roadmapStep.findMany({
        where: { roadmapId: null, status: { not: "DELETED" } },
        select: { id: true, title: true, status: true }
    });
    console.log(`\n⚡ Standalone modules (${standalone.length}):`);
    standalone.forEach(s => console.log(`   [${s.status}] ${s.title}`));

    await prisma.$disconnect();
}

main().catch(console.error);

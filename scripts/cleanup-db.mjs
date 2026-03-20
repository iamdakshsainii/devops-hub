import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function normalizeUrl(url) {
    if (!url) return "";
    try {
        const u = new URL(url.trim());
        ["si", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "feature", "ref"]
            .forEach((p) => u.searchParams.delete(p));
        return u.toString().toLowerCase();
    } catch {
        return url.trim().toLowerCase();
    }
}

async function main() {
    console.log("======================================");
    console.log("  AUDIT REPORT");
    console.log("======================================\n");

    // ── 1. Recycle bin items ───────────────────────────────────────────────
    const deletedModules = await prisma.roadmapStep.findMany({ where: { status: "DELETED" }, select: { id: true, title: true } });
    const deletedResources = await prisma.resource.findMany({ where: { status: "DELETED" }, select: { id: true, title: true, url: true, tags: true } });
    const deletedEvents = await prisma.event.findMany({ where: { status: "DELETED" }, select: { id: true, title: true } });
    const deletedRoadmaps = await prisma.roadmap.findMany({ where: { status: "DELETED" }, select: { id: true, title: true } });

    console.log(`🗑️  RECYCLE BIN`);
    console.log(`   Modules:   ${deletedModules.length}`);
    deletedModules.forEach(m => console.log(`     - [${m.id}] ${m.title}`));
    console.log(`   Resources: ${deletedResources.length}`);
    deletedResources.forEach(r => console.log(`     - [${r.id}] ${r.title} (tags: ${r.tags})`));
    console.log(`   Events:    ${deletedEvents.length}`);
    deletedEvents.forEach(e => console.log(`     - [${e.id}] ${e.title}`));
    console.log(`   Roadmaps:  ${deletedRoadmaps.length}`);
    deletedRoadmaps.forEach(r => console.log(`     - [${r.id}] ${r.title}`));

    // ── 2. Orphaned Module mirror rows (Resource tagged "Module" with no matching RoadmapResource) ──
    const moduleResources = await prisma.resource.findMany({
        where: { tags: "Module" },
        select: { id: true, title: true, url: true, status: true },
    });
    const allRoadmapResources = await prisma.roadmapResource.findMany({
        select: { url: true, globalResourceId: true },
    });
    const roadmapNormalizedUrls = new Set(allRoadmapResources.map(r => normalizeUrl(r.url)));
    const roadmapGlobalIds = new Set(allRoadmapResources.map(r => r.globalResourceId).filter(Boolean));

    const orphanedMirrors = moduleResources.filter(r =>
        !roadmapNormalizedUrls.has(normalizeUrl(r.url)) &&
        !roadmapGlobalIds.has(r.id)
    );

    console.log(`\n⚠️  ORPHANED MODULE MIRRORS (no matching RoadmapResource): ${orphanedMirrors.length}`);
    orphanedMirrors.forEach(r => console.log(`   - [${r.id}] ${r.title} | ${r.url} | status:${r.status}`));

    // ── 3. Duplicate Resource rows (same normalized URL, multiple active rows) ──
    const activeResources = await prisma.resource.findMany({
        where: { status: { not: "DELETED" } },
        select: { id: true, title: true, url: true, tags: true, createdAt: true },
        orderBy: { createdAt: "asc" },
    });
    const urlGroups = new Map();
    for (const r of activeResources) {
        const key = normalizeUrl(r.url);
        if (!key) continue;
        if (!urlGroups.has(key)) urlGroups.set(key, []);
        urlGroups.get(key).push(r);
    }
    const duplicateGroups = Array.from(urlGroups.values()).filter(g => g.length > 1);
    console.log(`\n⚠️  DUPLICATE RESOURCE URLS: ${duplicateGroups.length} group(s)`);
    duplicateGroups.forEach(group => {
        console.log(`   URL: ${group[0].url}`);
        group.forEach(r => console.log(`     [${r.id}] tags:${r.tags || "none"} created:${r.createdAt.toISOString().split("T")[0]}`));
    });

    // ── 4. RoadmapResources whose parent step is DELETED (still showing on platform) ──
    const roadmapResourcesUnderDeletedSteps = await prisma.roadmapResource.findMany({
        where: { step: { status: "DELETED" } },
        select: { id: true, title: true, url: true, stepId: true },
    });
    console.log(`\n⚠️  ROADMAP RESOURCES UNDER DELETED STEPS: ${roadmapResourcesUnderDeletedSteps.length}`);
    roadmapResourcesUnderDeletedSteps.forEach(r =>
        console.log(`   - [${r.id}] ${r.title} | stepId:${r.stepId}`)
    );

    console.log("\n======================================");
    console.log("  STARTING CLEANUP");
    console.log("======================================\n");

    let cleaned = 0;

    // ── Clean 1: Hard-delete everything in recycle bin ─────────────────────
    if (deletedResources.length > 0) {
        // Before deleting Resource rows, remove linked RoadmapResource mirror rows
        for (const r of deletedResources) {
            await prisma.roadmapResource.deleteMany({ where: { globalResourceId: r.id } });
        }
        const ids = deletedResources.map(r => r.id);
        await prisma.resource.deleteMany({ where: { id: { in: ids } } });
        console.log(`✅ Hard-deleted ${deletedResources.length} recycle bin Resource(s)`);
        cleaned += deletedResources.length;
    }

    if (deletedModules.length > 0) {
        for (const m of deletedModules) {
            // Delete topics + subtopics + resources for this step
            const topics = await prisma.roadmapTopic.findMany({ where: { stepId: m.id }, select: { id: true } });
            for (const t of topics) {
                await prisma.roadmapSubTopic.deleteMany({ where: { topicId: t.id } });
            }
            await prisma.roadmapTopic.deleteMany({ where: { stepId: m.id } });

            // Delete module resources + their global mirrors (tagged Module only)
            const moduleRR = await prisma.roadmapResource.findMany({
                where: { stepId: m.id },
                select: { id: true, globalResourceId: true },
            });
            for (const rr of moduleRR) {
                if (rr.globalResourceId) {
                    await prisma.resource.deleteMany({ where: { id: rr.globalResourceId, tags: "Module" } });
                }
            }
            await prisma.roadmapResource.deleteMany({ where: { stepId: m.id } });
            await prisma.roadmapStep.delete({ where: { id: m.id } });
        }
        console.log(`✅ Hard-deleted ${deletedModules.length} recycle bin Module(s) and their data`);
        cleaned += deletedModules.length;
    }

    if (deletedEvents.length > 0) {
        await prisma.event.deleteMany({ where: { status: "DELETED" } });
        console.log(`✅ Hard-deleted ${deletedEvents.length} recycle bin Event(s)`);
        cleaned += deletedEvents.length;
    }

    if (deletedRoadmaps.length > 0) {
        await prisma.roadmap.deleteMany({ where: { status: "DELETED" } });
        console.log(`✅ Hard-deleted ${deletedRoadmaps.length} recycle bin Roadmap(s)`);
        cleaned += deletedRoadmaps.length;
    }

    // ── Clean 2: Orphaned Module mirror rows ──────────────────────────────
    if (orphanedMirrors.length > 0) {
        const ids = orphanedMirrors.map(r => r.id);
        await prisma.resource.deleteMany({ where: { id: { in: ids } } });
        console.log(`✅ Deleted ${orphanedMirrors.length} orphaned Module mirror row(s)`);
        cleaned += orphanedMirrors.length;
    }

    // ── Clean 3: Duplicate Resource rows — keep newest, delete older dupes ─
    if (duplicateGroups.length > 0) {
        let dupCount = 0;
        for (const group of duplicateGroups) {
            // Sort newest first, keep newest
            const sorted = group.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const toDelete = sorted.slice(1);
            for (const r of toDelete) {
                await prisma.resource.delete({ where: { id: r.id } });
                dupCount++;
            }
        }
        console.log(`✅ Deleted ${dupCount} duplicate Resource row(s)`);
        cleaned += dupCount;
    }

    // ── Clean 4: RoadmapResources under deleted steps ─────────────────────
    if (roadmapResourcesUnderDeletedSteps.length > 0) {
        const ids = roadmapResourcesUnderDeletedSteps.map(r => r.id);
        await prisma.roadmapResource.deleteMany({ where: { id: { in: ids } } });
        console.log(`✅ Deleted ${roadmapResourcesUnderDeletedSteps.length} RoadmapResource(s) under deleted steps`);
        cleaned += roadmapResourcesUnderDeletedSteps.length;
    }

    console.log(`\n🎉 Total cleaned: ${cleaned} row(s)`);
    console.log("Database is now clean.");
    await prisma.$disconnect();
}

main().catch((e) => {
    console.error("Error:", e);
    process.exit(1);
});

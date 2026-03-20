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
    console.log("🔍 Fetching all RoadmapResources...");
    const roadmapResources = await prisma.roadmapResource.findMany({
        include: { step: { select: { title: true } } },
    });

    console.log(`Found ${roadmapResources.length} roadmap resource(s)\n`);

    for (const rr of roadmapResources) {
        if (!rr.url) continue;

        const normalizedUrl = normalizeUrl(rr.url);

        // Find ALL global Resource rows whose normalized URL matches
        const allGlobals = await prisma.resource.findMany({
            where: { tags: "Module" },
            select: { id: true, url: true, imageUrl: true, createdAt: true },
        });

        const matches = allGlobals.filter(
            (g) => g.url && normalizeUrl(g.url) === normalizedUrl
        );

        if (matches.length === 0) {
            console.log(`⚠️  No global mirror found for: ${rr.url}`);
            continue;
        }

        if (matches.length === 1) {
            // Single match — just ensure imageUrl is in sync with RoadmapResource
            const g = matches[0];
            const correctImageUrl = rr.imageUrl ?? null;
            if (g.imageUrl !== correctImageUrl) {
                await prisma.resource.update({
                    where: { id: g.id },
                    data: { imageUrl: correctImageUrl },
                });
                console.log(`✅ Synced imageUrl for: ${rr.url}`);
                console.log(`   Was: ${g.imageUrl} → Now: ${correctImageUrl}`);
            } else {
                console.log(`✓  Already in sync: ${rr.url}`);
            }

            // Update back-link if missing
            if (rr.globalResourceId !== g.id) {
                await prisma.roadmapResource.update({
                    where: { id: rr.id },
                    data: { globalResourceId: g.id },
                });
                console.log(`   Updated globalResourceId back-link`);
            }
            continue;
        }

        // Multiple duplicate rows — keep the newest, delete the rest
        console.log(`🗑️  Found ${matches.length} duplicates for: ${rr.url}`);
        const sorted = matches.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const keep = sorted[0];
        const toDelete = sorted.slice(1);

        for (const del of toDelete) {
            await prisma.resource.delete({ where: { id: del.id } });
            console.log(`   Deleted stale duplicate: ${del.id} (imageUrl: ${del.imageUrl})`);
        }

        // Sync imageUrl on the kept row to match RoadmapResource
        const correctImageUrl = rr.imageUrl ?? null;
        await prisma.resource.update({
            where: { id: keep.id },
            data: { imageUrl: correctImageUrl },
        });
        console.log(`   Kept: ${keep.id}, imageUrl set to: ${correctImageUrl}`);

        // Update back-link
        await prisma.roadmapResource.update({
            where: { id: rr.id },
            data: { globalResourceId: keep.id },
        });
    }

    console.log("\n✅ Cleanup complete.");
    await prisma.$disconnect();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

// scripts/backfill-resources.mjs
// Run once: node scripts/backfill-resources.mjs
// Mirrors all existing RoadmapResource rows into the global Resource table
// so the admin resources panel shows everything.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting backfill...");

    // Get all roadmap resources with their step info
    const roadmapResources = await prisma.roadmapResource.findMany({
        include: {
            step: {
                select: {
                    title: true,
                    roadmap: { select: { title: true } }
                }
            }
        }
    });

    console.log(`Found ${roadmapResources.length} roadmap resources to process.`);

    // Get any admin user to use as authorId
    const adminUser = await prisma.user.findFirst({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
        select: { id: true, fullName: true }
    });

    if (!adminUser) {
        console.error("No admin user found. Cannot backfill.");
        process.exit(1);
    }

    console.log(`Using admin: ${adminUser.fullName} (${adminUser.id})`);

    let created = 0;
    let skipped = 0;
    let linked = 0;

    for (const r of roadmapResources) {
        if (!r.url || r.url === "#") {
            skipped++;
            continue;
        }

        const urlKey = r.url.trim().toLowerCase();

        // Check if already mirrored
        const existing = await prisma.resource.findFirst({
            where: { url: { equals: urlKey } },
            select: { id: true }
        });

        if (existing) {
            // Already in global table — just link it back if not linked yet
            if (!r.globalResourceId) {
                await prisma.roadmapResource.update({
                    where: { id: r.id },
                    data: { globalResourceId: existing.id }
                });
                linked++;
            } else {
                skipped++;
            }
            continue;
        }

        // Create the mirror row in global Resource table
        const moduleLabel = r.step?.roadmap?.title
            ? `${r.step.roadmap.title} › ${r.step?.title || "Module"}`
            : r.step?.title || "Module";

        const created_resource = await prisma.resource.create({
            data: {
                title: r.title || "Module Resource",
                url: r.url,
                type: r.type || "ARTICLE",
                description: r.description
                    ? `${r.description} · From: ${moduleLabel}`
                    : `Resource from: ${moduleLabel}`,
                imageUrl: r.imageUrl || null,
                tags: "Module",
                status: "PUBLISHED",
                authorId: adminUser.id,
            }
        });

        // Link the RoadmapResource back to the global row
        await prisma.roadmapResource.update({
            where: { id: r.id },
            data: { globalResourceId: created_resource.id }
        });

        created++;
        console.log(`✓ Mirrored: ${r.title}`);
    }

    console.log("\n── Backfill complete ──────────────────");
    console.log(`  Created : ${created}`);
    console.log(`  Linked  : ${linked}`);
    console.log(`  Skipped : ${skipped}`);
    console.log("────────────────────────────────────────");

    await prisma.$disconnect();
}

main().catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
});

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Strips YouTube ?si= and other tracking query params so URLs match reliably
// regardless of how they were originally saved.
function normalizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  try {
    const u = new URL(url.trim());
    // Remove known tracking params that don't affect the resource identity
    ["si", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "feature", "ref"].forEach(
      (p) => u.searchParams.delete(p)
    );
    return u.toString().toLowerCase();
  } catch {
    // Not a valid URL — fall back to plain lowercase trim
    return url.trim().toLowerCase();
  }
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const step = await prisma.roadmapStep.findUnique({
      where: { id },
      include: {
        topics: {
          orderBy: { order: "asc" },
          include: { subtopics: { orderBy: { order: "asc" } } },
        },
        resources: { orderBy: { order: "asc" } },
      },
    });
    if (!step) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(step);
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { title, description, icon, status, tags, topics, resources, introContent } = await req.json();
    const resourceList: any[] = resources || [];

    // ── Pre-fetch outside transaction ──────────────────────────────────────

    // Existing RoadmapResources for this step
    const existingRoadmapResources = await prisma.roadmapResource.findMany({
      where: { stepId: id },
      select: { id: true, url: true, globalResourceId: true },
    });

    // Normalized incoming URLs
    const incomingNormalizedUrls = resourceList
      .map((r: any) => normalizeUrl(r.url))
      .filter(Boolean);

    // Fetch ALL global resources whose normalized URL matches any incoming URL.
    // We fetch by partial match since DB stores original URLs (with or without ?si=).
    // Strategy: fetch all global Resources that have any of the raw URLs, then
    // also normalise their stored URLs client-side for matching.
    const rawIncomingUrls = resourceList.map((r: any) => r.url?.trim()).filter(Boolean);

    const existingGlobals =
      rawIncomingUrls.length > 0
        ? await prisma.resource.findMany({
          where: { url: { in: rawIncomingUrls } },
          select: { id: true, url: true },
        })
        : [];

    // Also search by globalResourceId stored on existing RoadmapResources
    const existingGlobalIds = existingRoadmapResources
      .map((r) => r.globalResourceId)
      .filter((gid): gid is string => Boolean(gid));

    const existingGlobalsByBacklink =
      existingGlobalIds.length > 0
        ? await prisma.resource.findMany({
          where: { id: { in: existingGlobalIds } },
          select: { id: true, url: true },
        })
        : [];

    // Merge both sources; normalised URL → global Resource id
    const urlToGlobalId = new Map<string, string>();
    for (const g of [...existingGlobals, ...existingGlobalsByBacklink]) {
      if (g.url) urlToGlobalId.set(normalizeUrl(g.url), g.id);
    }

    // Also map by globalResourceId directly (for cases where URL changed)
    // roadmapResource.url (normalised) → globalResourceId
    const roadmapUrlToGlobalId = new Map<string, string | null>();
    for (const r of existingRoadmapResources) {
      roadmapUrlToGlobalId.set(normalizeUrl(r.url), r.globalResourceId ?? null);
    }

    const incomingNormalizedSet = new Set(incomingNormalizedUrls);

    // ── Transaction ────────────────────────────────────────────────────────
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Update topics if fully provided in payload triggerswards downwards smoothly.
        if (topics !== undefined) {
          await tx.roadmapTopic.deleteMany({ where: { stepId: id } });

          for (let idx = 0; idx < (topics || []).length; idx++) {
            const t = topics[idx];
            await tx.roadmapTopic.create({
              data: {
                stepId: id,
                title: t.title || "Untitled Topic",
                content: t.content || null,
                order: idx,
                subtopics: {
                  create: (t.subtopics || [])
                    .filter((s: any) => s.title)
                    .map((s: any, si: number) => ({
                      title: s.title,
                      content: s.content || "",
                      order: si,
                    })),
                },
              },
            });
          }
        }

        // 2. Update resources if fully provided in payload triggers downwards.
        if (resources !== undefined) {
          // Clean up global mirror rows for removed resources
          for (const [normalizedUrl, globalId] of roadmapUrlToGlobalId.entries()) {
            if (!incomingNormalizedSet.has(normalizedUrl) && globalId) {
              await tx.resource.deleteMany({
                where: { id: globalId, tags: "Module" },
              });
            }
          }

          // Delete old RoadmapResource rows for this step
          await tx.roadmapResource.deleteMany({ where: { stepId: id } });

          // Re-create RoadmapResources + upsert mirror into global Resource table
          for (let idx = 0; idx < resourceList.length; idx++) {
            const r = resourceList[idx];
            if (!r.title && !r.url) continue;

            const urlKey = normalizeUrl(r.url);
            const imageUrl: string | null = r.imageUrl?.trim() || null;
            let globalResourceId: string | null = null;

            if (urlKey) {
              if (urlToGlobalId.has(urlKey)) {
                const existingId = urlToGlobalId.get(urlKey)!;
                await tx.resource.update({
                  where: { id: existingId },
                  data: {
                    title: r.title || "Module Resource",
                    type: r.type || "ARTICLE",
                    description: r.description || `Resource from module: ${title || "Module"}`,
                    imageUrl,
                    tags: tags || "Module",
                    status: "PUBLISHED",
                  },
                });
                globalResourceId = existingId;
              } else {
                const created = await tx.resource.create({
                  data: {
                    title: r.title || "Module Resource",
                    url: r.url,
                    type: r.type || "ARTICLE",
                    description: r.description || `Resource from module: ${title || "Module"}`,
                    imageUrl,
                    tags: tags || "Module",
                    status: "PUBLISHED",
                    authorId: session.user.id,
                  },
                });
                globalResourceId = created.id;
                urlToGlobalId.set(urlKey, created.id);
              }
            }

            await tx.roadmapResource.create({
              data: {
                stepId: id,
                title: r.title || "",
                url: r.url || "",
                type: r.type || "ARTICLE",
                description: r.description || "",
                imageUrl,
                order: idx,
                ...(globalResourceId ? { globalResourceId } : {}),
              },
            });
          }
        }

        // 6. Update the step itself
        return tx.roadmapStep.update({
          where: { id },
          data: {
            ...(title !== undefined ? { title: title || "Untitled" } : {}),
            ...(description !== undefined ? { description } : {}),
            ...(icon !== undefined ? { icon: icon || "📦" } : {}),
            ...(status !== undefined ? { status } : {}),
            ...(tags !== undefined ? { tags } : {}),
            ...(introContent !== undefined ? { introContent } : {}),
          },
        });
      },
      { timeout: 30000, maxWait: 5000 }
    );

    return NextResponse.json({ message: "Updated", step: result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;

    // cleanup floating resources for this module before soft-deleting
    const roadmapResources = await prisma.roadmapResource.findMany({
      where: { stepId: id },
      select: { globalResourceId: true }
    });

    // Disconnect any RoadmapStepModule attachments so deleting doesn't break parent structures or graph links downwards inwards onwardswards.
    await prisma.roadmapStepModule.deleteMany({
      where: {
        OR: [
          { stepId: id },
          { moduleId: id }
        ]
      }
    });

    await prisma.roadmapStep.update({ where: { id }, data: { status: "DELETED" } });

    const globalIds = roadmapResources.map(r => r.globalResourceId).filter(Boolean) as string[];
    if (globalIds.length > 0) {
      // Soft delete global mirrored rows mapped only to this module 
      await prisma.resource.updateMany({
        where: { id: { in: globalIds }, tags: "Module" },
        data: { status: "DELETED" }
      });
    }

    return NextResponse.json({ message: "Soft Deleted and Unlinked" });

  } catch (err) {
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}

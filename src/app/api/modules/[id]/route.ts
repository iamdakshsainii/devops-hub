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
        // 1. Delete existing topics (subtopics cascade)
        await tx.roadmapTopic.deleteMany({ where: { stepId: id } });

        // 2. Re-create topics + subtopics
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

        // 3. Clean up global mirror rows for removed resources
        for (const [normalizedUrl, globalId] of roadmapUrlToGlobalId.entries()) {
          if (!incomingNormalizedSet.has(normalizedUrl) && globalId) {
            await tx.resource.deleteMany({
              where: { id: globalId, tags: "Module" },
            });
          }
        }

        // 4. Delete old RoadmapResource rows for this step
        await tx.roadmapResource.deleteMany({ where: { stepId: id } });

        // 5. Re-create RoadmapResources + upsert mirror into global Resource table
        for (let idx = 0; idx < resourceList.length; idx++) {
          const r = resourceList[idx];
          if (!r.title && !r.url) continue;

          const urlKey = normalizeUrl(r.url);
          // Explicitly null when empty string — never keep stale cover
          const imageUrl: string | null = r.imageUrl?.trim() || null;
          let globalResourceId: string | null = null;

          if (urlKey) {
            if (urlToGlobalId.has(urlKey)) {
              // Global row exists — update it fully (including imageUrl cleared to null)
              const existingId = urlToGlobalId.get(urlKey)!;
              await tx.resource.update({
                where: { id: existingId },
                data: {
                  title: r.title || "Module Resource",
                  type: r.type || "ARTICLE",
                  description:
                    r.description || `Resource from module: ${title || "Module"}`,
                  imageUrl,          // ← explicit null when cleared
                  tags: tags || "Module",
                  status: "PUBLISHED",
                },
              });
              globalResourceId = existingId;
            } else {
              // No global row yet — create one
              const created = await tx.resource.create({
                data: {
                  title: r.title || "Module Resource",
                  url: r.url,
                  type: r.type || "ARTICLE",
                  description:
                    r.description || `Resource from module: ${title || "Module"}`,
                  imageUrl,          // ← explicit null when cleared
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
              imageUrl,              // ← explicit null when cleared
              order: idx,
              ...(globalResourceId ? { globalResourceId } : {}),
            },
          });
        }

        // 6. Update the step itself
        return tx.roadmapStep.update({
          where: { id },
          data: {
            title: title || "Untitled",
            description: description || "",
            icon: icon || "📦",
            status: status || "PENDING",
            tags: tags || "",
            introContent: introContent !== undefined ? introContent : undefined,
          } as any,
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
    await prisma.roadmapStep.update({ where: { id }, data: { status: "DELETED" } });
    return NextResponse.json({ message: "Soft Deleted" });
  } catch (err) {
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}

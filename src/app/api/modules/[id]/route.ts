import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const step = await prisma.roadmapStep.findUnique({
      where: { id },
      include: {
        topics: {
          orderBy: { order: "asc" },
          include: { subtopics: { orderBy: { order: "asc" } } }
        },
        resources: { orderBy: { order: "asc" } },
      }
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
    const { title, description, icon, status, topics, resources } = await req.json();
    const resourceList = resources || [];

    // ── Pre-fetch outside transaction to avoid timeout ─────────────────────

    // Existing RoadmapResources for this step (need globalResourceId for cleanup)
    const existingRoadmapResources = await prisma.roadmapResource.findMany({
      where: { stepId: id },
      select: { id: true, url: true, globalResourceId: true }
    });

    // Which URLs already exist in the global Resource table
    const incomingUrls = resourceList
      .map((r: any) => r.url?.trim().toLowerCase())
      .filter(Boolean);

    const existingGlobals = incomingUrls.length > 0
      ? await prisma.resource.findMany({
        where: { url: { in: incomingUrls } },
        select: { id: true, url: true }
      })
      : [];

    // url → existing global Resource id
    const urlToGlobalId = new Map<string, string>();
    for (const g of existingGlobals) {
      if (g.url) urlToGlobalId.set(g.url.trim().toLowerCase(), g.id);
    }

    // url → globalResourceId from the OLD roadmap resources (for cleanup)
    const oldUrlToGlobalId = new Map<string, string | null>();
    for (const r of existingRoadmapResources) {
      if (r.url) oldUrlToGlobalId.set(r.url.trim().toLowerCase(), r.globalResourceId ?? null);
    }

    const incomingUrlsSet = new Set(incomingUrls);

    // ── Transaction ────────────────────────────────────────────────────────
    const result = await prisma.$transaction(
      async (tx) => {

        // 1. Delete topics (subtopics cascade)
        await tx.roadmapTopic.deleteMany({ where: { stepId: id } });

        // 2. Re-create topics + subtopics
        for (let idx = 0; idx < (topics || []).length; idx++) {
          const t = topics[idx];
          const topic = await tx.roadmapTopic.create({
            data: {
              stepId: id,
              title: t.title || "Untitled Topic",
              content: t.content || null,
              order: idx,
            },
          });
          for (let si = 0; si < (t.subtopics || []).length; si++) {
            const s = t.subtopics[si];
            if (s.title) {
              await tx.roadmapSubTopic.create({
                data: {
                  topicId: topic.id,
                  title: s.title,
                  content: s.content || "",
                  order: si,
                },
              });
            }
          }
        }

        // 3. Clean up removed resources:
        //    Delete global mirror rows that this module created (tagged "Module")
        //    but are no longer in the incoming list.
        for (const [urlKey, globalId] of oldUrlToGlobalId.entries()) {
          if (!incomingUrlsSet.has(urlKey) && globalId) {
            await tx.resource.deleteMany({
              where: {
                id: globalId,
                tags: "Module", // Only delete rows WE created — never touch manually added ones
              }
            });
          }
        }

        // 4. Delete old RoadmapResource rows for this step
        await tx.roadmapResource.deleteMany({ where: { stepId: id } });

        // 5. Re-create RoadmapResources + upsert mirror into global Resource table
        for (let idx = 0; idx < resourceList.length; idx++) {
          const r = resourceList[idx];
          if (!r.title && !r.url) continue;

          const urlKey = r.url?.trim().toLowerCase() ?? "";
          let globalResourceId: string | null = null;

          if (urlKey) {
            if (urlToGlobalId.has(urlKey)) {
              // Global row already exists — update it to stay in sync
              const existingId = urlToGlobalId.get(urlKey)!;
              await tx.resource.update({
                where: { id: existingId },
                data: {
                  title: r.title || "Module Resource",
                  type: r.type || "ARTICLE",
                  description: r.description || `Resource from module: ${title || "Module"}`,
                  imageUrl: r.imageUrl || null,
                  status: "PUBLISHED",
                }
              });
              globalResourceId = existingId;
            } else {
              // No global row yet — create one
              const created = await tx.resource.create({
                data: {
                  title: r.title || "Module Resource",
                  url: r.url,
                  type: r.type || "ARTICLE",
                  description: r.description || `Resource from module: ${title || "Module"}`,
                  imageUrl: r.imageUrl || null,
                  tags: "Module",
                  status: "PUBLISHED",
                  authorId: session.user.id,
                }
              });
              globalResourceId = created.id;
              urlToGlobalId.set(urlKey, created.id); // prevent duplicate in same save
            }
          }

          await tx.roadmapResource.create({
            data: {
              stepId: id,
              title: r.title || "",
              url: r.url || "",
              type: r.type || "ARTICLE",
              description: r.description || "",
              imageUrl: r.imageUrl || null,
              order: idx,
              ...(globalResourceId ? { globalResourceId } : {}),
            },
          });
        }

        // 6. Update the step
        return tx.roadmapStep.update({
          where: { id },
          data: {
            title: title || "Untitled",
            description: description || "",
            icon: icon || "📦",
            status: status || "PENDING",
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
    await prisma.roadmapStep.update({ where: { id }, data: { status: "DELETED" } });
    return NextResponse.json({ message: "Soft Deleted" });
  } catch (err) {
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}
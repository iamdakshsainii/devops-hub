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

    // ── Step 1: Do the global resource mirror check OUTSIDE the transaction.
    // findFirst calls inside a long transaction burn time — do them upfront.
    const resourceList = resources || [];
    const resourceUrls = resourceList.map((r: any) => r.url).filter(Boolean);

    const existingGlobalUrls = new Set<string>();
    if (resourceUrls.length > 0) {
      const existing = await prisma.resource.findMany({
        where: { url: { in: resourceUrls } },
        select: { url: true },
      });
      existing.forEach((r) => existingGlobalUrls.add(r.url));
    }

    // ── Step 2: Run the transaction with a generous timeout (30s).
    // timeout is in milliseconds.
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Delete existing topics (cascade deletes subtopics) and resources
        await tx.roadmapTopic.deleteMany({ where: { stepId: id } });
        await tx.roadmapResource.deleteMany({ where: { stepId: id } });

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

          const subs = t.subtopics || [];
          for (let si = 0; si < subs.length; si++) {
            const s = subs[si];
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

        // 3. Re-create resources
        for (let idx = 0; idx < resourceList.length; idx++) {
          const r = resourceList[idx];
          await tx.roadmapResource.create({
            data: {
              stepId: id,
              title: r.title || "",
              url: r.url || "",
              type: r.type || "ARTICLE",
              description: r.description || "",
              imageUrl: r.imageUrl || null,
              order: idx,
            },
          });

          // Smart mirror — only insert if not already in global resources
          // (checked outside the transaction so no extra queries here)
          if (r.url && !existingGlobalUrls.has(r.url)) {
            await tx.resource.create({
              data: {
                title: r.title || "Module Resource",
                url: r.url || "",
                type: r.type || "ARTICLE",
                description: r.description || `Resource from module: ${title || "Standalone"}`,
                tags: "Module",
                status: "PUBLISHED",
                authorId: session.user.id,
              },
            });
          }
        }

        // 4. Update the step itself
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
      {
        // Increase timeout to 30 seconds — default is 5s which is too short
        // for large modules with many topics + subtopics
        timeout: 30000,
        maxWait: 5000,
      }
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
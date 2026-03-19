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

    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete all existing topics (cascade deletes subtopics) and resources
      await tx.roadmapTopic.deleteMany({ where: { stepId: id } });
      await tx.roadmapResource.deleteMany({ where: { stepId: id } });

      // 2. Re-create topics with subtopics
      for (let idx = 0; idx < (topics || []).length; idx++) {
        const t = topics[idx];
        const topic = await tx.roadmapTopic.create({
          data: {
            stepId: id,
            title: t.title || "Untitled Topic",
            content: t.content || null,
            order: idx,
          }
        });

        // Create subtopics if any
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
              }
            });
          }
        }
      }

      // 3. Re-create resources
      if (resources?.length) {
        await tx.roadmapResource.createMany({
          data: resources.map((r: any, idx: number) => ({
            stepId: id,
            title: r.title || "",
            url: r.url || "",
            type: r.type || "ARTICLE",
            description: r.description || "",
            order: idx,
          }))
        });
      }

      return tx.roadmapStep.update({
        where: { id },
        data: {
          title: title || "Untitled",
          description: description || "",
          icon: icon || "📦",
          status: status || "PENDING",
        }
      });
    });

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
    await prisma.roadmapStep.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}

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
        topics: { orderBy: { order: "asc" } },
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
    const { title, description, icon, topics, resources } = await req.json();

    const result = await prisma.$transaction(async (tx) => {
       // Delete children inside step
       await tx.roadmapTopic.deleteMany({ where: { stepId: id } });
       await tx.roadmapResource.deleteMany({ where: { stepId: id } });

       return tx.roadmapStep.update({
         where: { id },
         data: {
           title,
           description: description || "",
           icon: icon || "📦",
           topics: {
             create: topics?.map((t: any, idx: number) => ({ title: t.title, content: t.content || "", order: idx })) || []
           },
           resources: {
             create: resources?.map((r: any, idx: number) => ({ title: r.title, url: r.url, type: r.type || "ARTICLE", order: idx })) || []
           }
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

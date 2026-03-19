import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET ALL standalone modules
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    
    const steps = await prisma.roadmapStep.findMany({
      where: all ? {} : { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      include: {
        roadmap: { select: { title: true, color: true } },
        _count: { select: { topics: true, resources: true } }
      }
    });
    return NextResponse.json(steps);
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST create standalone step node 
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, icon, roadmapId, topics, resources } = await req.json();

    if (!title) return NextResponse.json({ message: "Title required" }, { status: 400 });

    // Ensure dummy roadmap exists to anchor standalone steps if missing
    let targetRoadmapId = roadmapId;
    if (!targetRoadmapId) {
       const general = await prisma.roadmap.findFirst({ where: { title: "General Modules" } });
       if (general) targetRoadmapId = general.id;
       else {
          const newGeneral = await prisma.roadmap.create({
             data: { title: "General Modules", description: "Standalone independent templates", status: "PUBLISHED" }
          });
          targetRoadmapId = newGeneral.id;
       }
    }

    const maxOrder = await prisma.roadmapStep.aggregate({
       where: { roadmapId: targetRoadmapId },
       _max: { order: true }
    });

    const status = session.user.role === "SUPER_ADMIN" ? "PUBLISHED" : "PENDING";

    const step = await prisma.roadmapStep.create({
      data: {
        title,
        description: description || "",
        icon: icon || "📦",
        order: (maxOrder._max.order ?? -1) + 1,
        roadmapId: targetRoadmapId,
        status,
        authorId: session.user.id,
        topics: {
           create: topics?.map((t: any, idx: number) => ({ title: t.title, content: t.content || "", order: idx })) || []
        },
        resources: {
          create: resources?.map((r: any, idx: number) => ({ title: r.title, url: r.url, type: r.type || "ARTICLE", order: idx })) || []
        }
      }
    });

    return NextResponse.json({ message: "Created", step }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

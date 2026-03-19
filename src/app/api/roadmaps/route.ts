import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all roadmaps (public)
export async function GET() {
  try {
    const roadmaps = await prisma.roadmap.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      include: {
        steps: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            icon: true,
            order: true,
            _count: { select: { topics: true, resources: true } }
          }
        }
      }
    });

    return NextResponse.json(roadmaps);
  } catch (error) {
    console.error("Roadmap fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch roadmaps" }, { status: 500 });
  }
}

// POST create a new roadmap (admin only) — supports full nested JSON
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, icon, color, status, steps } = body;

    if (!title || !description) {
      return NextResponse.json({ message: "Title and description are required" }, { status: 400 });
    }

    const maxOrder = await prisma.roadmap.aggregate({ _max: { order: true } });

    const roadmap = await prisma.roadmap.create({
      data: {
        title,
        description,
        icon: icon || "🗺️",
        color: color || "#3B82F6",
        status: status || "PUBLISHED",
        order: (maxOrder._max.order ?? -1) + 1,
        steps: steps?.length ? {
          create: steps.map((step: any, si: number) => ({
            title: step.title,
            description: step.description || "",
            icon: step.icon || "📦",
            order: si,
            topics: step.topics?.length ? {
              create: step.topics.map((topic: any, ti: number) => ({
                title: topic.title,
                content: topic.content || "",
                order: ti,
              }))
            } : undefined,
            resources: step.resources?.length ? {
              create: step.resources.map((res: any, ri: number) => ({
                title: res.title,
                url: res.url,
                type: res.type || "ARTICLE",
                description: res.description || null,
                order: ri,
              }))
            } : undefined,
          }))
        } : undefined,
      },
      include: {
        steps: {
          include: { topics: true, resources: true },
          orderBy: { order: "asc" }
        }
      }
    });

    return NextResponse.json({ message: "Roadmap created", roadmap }, { status: 201 });
  } catch (error) {
    console.error("Roadmap create error:", error);
    return NextResponse.json({ message: "Failed to create roadmap" }, { status: 500 });
  }
}

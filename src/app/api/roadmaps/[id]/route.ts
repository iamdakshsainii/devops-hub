import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET single roadmap with full nested data (public)
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const roadmap = await prisma.roadmap.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { order: "asc" },
          include: {
            topics: { orderBy: { order: "asc" } },
            resources: { orderBy: { order: "asc" } },
          }
        }
      }
    });

    if (!roadmap) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(roadmap);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PUT update entire roadmap (admin only) — replaces all nested data
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { title, description, icon, color, status, order, steps } = body;

    // Use a transaction to update roadmap + replace all children
    const roadmap = await prisma.$transaction(async (tx) => {
      // Delete old steps (cascades to topics & resources)
      await tx.roadmapStep.deleteMany({ where: { roadmapId: id } });

      // Update roadmap and create new steps
      return tx.roadmap.update({
        where: { id },
        data: {
          title,
          description,
          icon: icon || "🗺️",
          color: color || "#3B82F6",
          status: status || "PUBLISHED",
          order: order ?? 0,
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
    });

    return NextResponse.json({ message: "Roadmap updated", roadmap });
  } catch (error) {
    console.error("Roadmap update error:", error);
    return NextResponse.json({ message: "Failed to update roadmap" }, { status: 500 });
  }
}

// DELETE a roadmap (admin only)
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    await prisma.roadmap.update({
      where: { id },
      data: { status: "DELETED" }
    });

    return NextResponse.json({ message: "Roadmap moved to recycle bin" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}

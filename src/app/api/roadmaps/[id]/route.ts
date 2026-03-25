import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET single roadmap with full nested data (public)
export async function GET(req: Request, context: any) {
  try {
    const resolvedParams = await context.params;
    const id = resolvedParams.id;
    
    const roadmap = await prisma.roadmap.findUnique({
      where: { id },
      include: {
        steps: {
          where: { status: { not: "DELETED" } },
          orderBy: { order: "asc" },
          include: {
            topics: { orderBy: { order: "asc" } },
            resources: { orderBy: { order: "asc" } },
          },
        },
      },
    });

    if (!roadmap) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(roadmap);
  } catch (error: any) {
    console.error("Roadmap GET error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PUT — updates roadmap metadata ONLY (title, description, icon, color, status, order)
// Steps are managed independently via /api/modules/[id]
// This prevents accidentally destroying module content on roadmap save
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { title, description, icon, color, status, order, steps } = body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Roadmap Metadata
      let roadmap;
      try {
        roadmap = await tx.roadmap.update({
          where: { id },
          data: {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(icon !== undefined && { icon }),
            ...(color !== undefined && { color }),
            ...(status !== undefined && { status }),
            ...(order !== undefined && { order }),
          },
        });
      } catch (err: any) {
        throw err;
      }

      // 2. Update Outer Step Metadata (without destroying topics/resources)
      if (steps && Array.isArray(steps)) {
        for (const s of steps) {
          if (s.id) {
            try {
              await tx.roadmapStep.update({
                where: { id: s.id },
                data: {
                  ...(s.title !== undefined && { title: s.title }),
                  ...(s.description !== undefined && { description: s.description }),
                  ...(s.icon !== undefined && { icon: s.icon }),
                  ...(s.status !== undefined && { status: s.status }),
                },
              });
            } catch (err: any) {
              throw err; // rethrow to abort transaction correctly
            }
          }
        }
      }

      return roadmap;
    }, {
      timeout: 20000 // 20 seconds
    });

    return NextResponse.json({ message: "Roadmap updated", roadmap: result });
  } catch (error: any) {
    console.error("Roadmap update error:", error);
    return NextResponse.json({ message: "Failed to update roadmap" }, { status: 500 });
  }
}

// DELETE — soft delete
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await prisma.roadmap.update({ where: { id }, data: { status: "DELETED" } });
    return NextResponse.json({ message: "Roadmap moved to recycle bin" });
  } catch {
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}
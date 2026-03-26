import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string; stepId: string }> }) {
  try {
    const { stepId } = await params;
    
    // Fetch attached modules for this specific RoadmapStep
    const attachments = await prisma.roadmapStepModule.findMany({
      where: { stepId },
      include: {
        module: {
          include: {
            _count: { select: { topics: true, resources: true } }
          }
        }
      },
      orderBy: { order: "asc" }
    });

    return NextResponse.json(attachments);
  } catch (err) {
    console.error("GET ATTACHMENTS ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string; stepId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { stepId } = await params;
    const body = await req.json();
    const { moduleId, order, isOptional, optionalDescription } = body;

    if (!moduleId) return NextResponse.json({ message: "Module ID required" }, { status: 400 });

    const existing = await prisma.roadmapStepModule.findUnique({
      where: { stepId_moduleId: { stepId, moduleId } }
    });
    if (existing) return NextResponse.json({ message: "Already attached" }, { status: 409 });

    const attachment = await prisma.roadmapStepModule.create({
      data: {
        stepId,
        moduleId,
        order: order !== undefined ? parseInt(order as any) : 0,
        isOptional: !!isOptional,
        optionalDescription
      }
    });

    return NextResponse.json({ message: "Attached", attachment }, { status: 201 });
  } catch (err) {
    console.error("POST ATTACHMENT ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; stepId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { stepId } = await params;
    const { moduleId, isOptional, order, optionalDescription } = await req.json();

    if (!moduleId) return NextResponse.json({ message: "Module ID required" }, { status: 400 });

    const attachment = await prisma.roadmapStepModule.update({
      where: {
        stepId_moduleId: { stepId, moduleId }
      },
      data: {
        isOptional: isOptional !== undefined ? !!isOptional : undefined,
        order: order !== undefined ? parseInt(order as any) : undefined,
        optionalDescription: optionalDescription !== undefined ? optionalDescription : undefined
      }
    });

    return NextResponse.json({ message: "Updated", attachment });
  } catch (err) {
    console.error("PATCH ATTACHMENT ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; stepId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { stepId } = await params;
    const { moduleId } = await req.json();

    if (!moduleId) return NextResponse.json({ message: "Module ID required" }, { status: 400 });

    await prisma.roadmapStepModule.delete({
      where: {
        stepId_moduleId: { stepId, moduleId }
      }
    });

    return NextResponse.json({ message: "Detached" });
  } catch (err) {
    console.error("DELETE ATTACHMENT ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

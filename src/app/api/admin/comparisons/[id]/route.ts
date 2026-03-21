import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Single Comparison
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const comp = await prisma.toolComparison.findUnique({
      where: { id },
      include: {
         toolA: { select: { name: true, slug: true } },
         toolB: { select: { name: true, slug: true } }
      }
    });

    if (!comp) {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    return NextResponse.json({
        ...comp,
        criteria: comp.criteria ? JSON.parse(comp.criteria) : []
    });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 });
  }
}

// PUT - Update Comparison
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { toolAId, toolBId, criteria, summary, status } = await req.json();

    const existing = await prisma.toolComparison.findUnique({ where: { id } });
    if (!existing) {
       return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    let slug = existing.slug;
    if (toolAId && toolBId && (toolAId !== existing.toolAId || toolBId !== existing.toolBId)) {
        const toolA = await prisma.tool.findUnique({ where: { id: toolAId } });
        const toolB = await prisma.tool.findUnique({ where: { id: toolBId } });
        if (toolA && toolB) {
            slug = `${toolA.slug}-vs-${toolB.slug}`;
        }
    }

    const updated = await prisma.toolComparison.update({
      where: { id },
      data: {
        toolAId: toolAId || existing.toolAId,
        toolBId: toolBId || existing.toolBId,
        slug,
        criteria: criteria ? JSON.stringify(criteria) : existing.criteria,
        summary: summary || existing.summary,
        status: status || existing.status,
      }
    });

    return NextResponse.json({ message: "Updated", comparison: updated });
  } catch (error) {
    console.error("Update comparison failure:", error);
    return NextResponse.json({ message: "Failed to update" }, { status: 500 });
  }
}

// DELETE - Soft Delete
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updated = await prisma.toolComparison.update({
       where: { id },
       data: { status: "DELETED" }
    });

    return NextResponse.json({ message: "Soft deleted", comparison: updated });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}

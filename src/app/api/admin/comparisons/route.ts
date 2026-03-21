import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { toolAId, toolBId, criteria, summary, status } = await req.json();

    if (!toolAId || !toolBId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const toolA = await prisma.tool.findUnique({ where: { id: toolAId } });
    const toolB = await prisma.tool.findUnique({ where: { id: toolBId } });

    if (!toolA || !toolB) {
       return NextResponse.json({ message: "Tools not found" }, { status: 400 });
    }

    const slug = `${toolA.slug}-vs-${toolB.slug}`;
    
    // Check collision
    const existing = await prisma.toolComparison.findUnique({ where: { slug } });
    if (existing) {
       return NextResponse.json({ message: "Comparison setup already exists" }, { status: 400 });
    }

    const comparison = await prisma.toolComparison.create({
      data: {
        toolAId,
        toolBId,
        slug,
        criteria: criteria ? JSON.stringify(criteria) : "",
        summary: summary || "",
        status: status || "PUBLISHED",
        authorId: (session as any).user.id
      }
    });

    return NextResponse.json({ message: "Created", comparison }, { status: 201 });
  } catch (error) {
    console.error("Create comparison failure:", error);
    return NextResponse.json({ message: "Failed to create" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Single Tool
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tool = await prisma.tool.findUnique({
      where: { id }
    });

    if (!tool) {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    // Parse JSON stringified fields
    return NextResponse.json({
        ...tool,
        pros: tool.pros ? JSON.parse(tool.pros) : [],
        cons: tool.cons ? JSON.parse(tool.cons) : [],
        useCases: tool.useCases ? JSON.parse(tool.useCases) : []
    });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 });
  }
}

// PUT - Update Tool
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { 
      name, slug, description, category, icon, 
      logoUrl, docsUrl, githubUrl, difficulty, license, 
      tags, pros, cons, useCases, status,
      moduleUrl, resourceUrl 
    } = await req.json();

    const existing = await prisma.tool.findUnique({ where: { id } });
    if (!existing) {
       return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    const updated = await prisma.tool.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        category,
        icon: icon || existing.icon,
        logoUrl: logoUrl || null,
        docsUrl: docsUrl || null,
        githubUrl: githubUrl || null,
        difficulty: difficulty || existing.difficulty,
        license: license || existing.license,
        tags: tags || null,
        moduleUrl: moduleUrl || null,
        resourceUrl: resourceUrl || null,
        pros: pros ? JSON.stringify(pros) : null,
        cons: cons ? JSON.stringify(cons) : null,
        useCases: useCases ? JSON.stringify(useCases) : null,
        status: status || existing.status,
      }
    });

    return NextResponse.json({ message: "Updated", tool: updated });
  } catch (error) {
    console.error("Update tool failure:", error);
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

    const updated = await prisma.tool.update({
       where: { id },
       data: { status: "DELETED" }
    });

    return NextResponse.json({ message: "Soft deleted", tool: updated });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}

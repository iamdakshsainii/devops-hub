import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(resource);
  } catch { return NextResponse.json({ message: "Server error" }, { status: 500 }); }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { title, description, type, url, tags, imageUrl, status } = await req.json();

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        title,
        description,
        type,
        url,
        tags: tags || "General",
        imageUrl: imageUrl || null,
        status: status || "PUBLISHED"
      }
    });

    return NextResponse.json({ message: "Updated", resource });
  } catch { return NextResponse.json({ message: "Failed to update" }, { status: 500 }); }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await prisma.resource.update({
      where: { id },
      data: { status: "DELETED" }
    });
    
    return NextResponse.json({ message: "Soft Deleted" });
  } catch { return NextResponse.json({ message: "Failed to delete" }, { status: 500 }); }
}

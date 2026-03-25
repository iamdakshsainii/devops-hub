import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Single Blog
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!post) {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 });
  }
}

// PUT - Update Blog
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { 
      title, slug, excerpt, content, coverImage, 
      category, icon, tags, readTime, status, isPinned 
    } = await req.json();

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
       return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        category,
        coverImage: coverImage || null,
        readTime: readTime ? Number(readTime) : existing.readTime,
        tags: tags || null,
        status: status || existing.status,
        isPinned: isPinned !== undefined ? !!isPinned : existing.isPinned,
      }
    });

    return NextResponse.json({ message: "Updated", post: updated });
  } catch (error) {
    console.error("Update blog failure:", error);
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

    const updated = await prisma.blogPost.update({
       where: { id },
       data: { status: "DELETED" }
    });

    return NextResponse.json({ message: "Soft deleted", post: updated });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}

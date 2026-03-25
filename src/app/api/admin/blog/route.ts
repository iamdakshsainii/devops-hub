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

    const { 
      title, slug, excerpt, content, coverImage, 
      category, tags, readTime, status, isPinned 
    } = await req.json();

    if (!title || !slug || !content || !category) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check slug collision
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
       return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
    }

    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        category,
        coverImage: coverImage || null,
        readTime: readTime ? Number(readTime) : 5,
        tags: tags || null,
        status: status || "DRAFT",
        isPinned: !!isPinned,
        authorId: session.user.id
      }
    });

    return NextResponse.json({ message: "Created", blogPost }, { status: 201 });
  } catch (error) {
    console.error("Create blog failure:", error);
    return NextResponse.json({ message: "Failed to create" }, { status: 500 });
  }
}

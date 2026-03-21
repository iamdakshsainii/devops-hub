import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - All published comments by slug
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) {
       return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    const comments = await prisma.blogComment.findMany({
      where: { postId: post.id, status: "PUBLISHED" },
      include: {
         author: { select: { fullName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 });
  }
}

// POST - Create comment
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const { content } = await req.json();
    if (!content) {
       return NextResponse.json({ message: "Content missing" }, { status: 400 });
    }

    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) {
       return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    const comment = await prisma.blogComment.create({
      data: {
        content,
        postId: post.id,
        status: "PUBLISHED",
        authorId: session.user.id
      },
      include: {
        author: { select: { fullName: true, avatarUrl: true } }
      }
    });

    return NextResponse.json({ message: "Created", comment }, { status: 201 });
  } catch (error) {
    console.error("Comment failure:", error);
    return NextResponse.json({ message: "Failed to create" }, { status: 500 });
  }
}

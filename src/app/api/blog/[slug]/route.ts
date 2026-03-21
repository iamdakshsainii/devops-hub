import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const postExists = await prisma.blogPost.findUnique({ where: { slug } });
    if (!postExists || postExists.status === "DELETED") {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    const updated = await prisma.blogPost.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
      include: {
        author: { select: { fullName: true, avatarUrl: true, role: true, bio: true, createdAt: true } },
        _count: { select: { comments: true } }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch post" }, { status: 500 });
  }
}

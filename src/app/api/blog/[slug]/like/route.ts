import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const updated = await prisma.blogPost.update({
      where: { slug },
      data: { likeCount: { increment: 1 } }
    });

    return NextResponse.json({ message: "Liked", likeCount: updated.likeCount });
  } catch (error) {
    return NextResponse.json({ message: "Failed to like" }, { status: 500 });
  }
}

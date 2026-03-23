import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const post = await prisma.blogPost.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, viewCount: post.viewCount });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update viewCount" }, { status: 400 });
  }
}

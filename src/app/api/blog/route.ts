import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = { status: "PUBLISHED" };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } }
      ];
    }

    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        author: { select: { fullName: true, avatarUrl: true, role: true } },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch blogs" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";

    const where: any = { status: "PUBLISHED" };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } }
      ];
    }

    const orderBy: any = {};
    if (sort === "newest") orderBy.createdAt = "desc";
    else if (sort === "oldest") orderBy.createdAt = "asc";
    else if (sort === "most-viewed") orderBy.viewCount = "desc";
    else orderBy.createdAt = "desc";

    const cheatsheets = await prisma.cheatsheet.findMany({
      where,
      include: {
        author: { select: { fullName: true, avatarUrl: true } },
        _count: { select: { sections: true } }
      },
      orderBy
    });

    return NextResponse.json(cheatsheets);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch cheatsheets" }, { status: 500 });
  }
}

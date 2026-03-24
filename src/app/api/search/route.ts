import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ blogs: [], cheatsheets: [], modules: [], roadmaps: [], events: [], resources: [] });
    }

    const orQuery = [
       { title: { contains: query, mode: "insensitive" } as any },
       { tags: { contains: query, mode: "insensitive" } as any }
    ];

    const [blogs, cheatsheets, modules, roadmaps, events, resources] = await Promise.all([
      prisma.blogPost.findMany({
        where: { OR: orQuery, status: "PUBLISHED" },
        select: { id: true, title: true, slug: true },
        take: 4
      }),
      prisma.cheatsheet.findMany({
        where: { OR: orQuery, status: "PUBLISHED" },
        select: { id: true, title: true, slug: true },
        take: 4
      }),
      prisma.roadmapStep.findMany({
        where: { OR: orQuery, status: "PUBLISHED" },
        select: { id: true, title: true },
        take: 4
      }),
      prisma.roadmap.findMany({
        where: { title: { contains: query, mode: "insensitive" }, status: "PUBLISHED" },
        select: { id: true, title: true },
        take: 3
      }),
      prisma.event.findMany({
        where: { OR: orQuery, status: "PUBLISHED" },
        select: { id: true, title: true },
        take: 3
      }),
      prisma.resource.findMany({
        where: { OR: orQuery, status: "PUBLISHED" },
        select: { id: true, title: true },
        take: 3
      })
    ]);

    return NextResponse.json({ blogs, cheatsheets, modules, roadmaps, events, resources });
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}

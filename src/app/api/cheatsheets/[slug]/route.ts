import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const cheatsheet = await prisma.cheatsheet.findUnique({
      where: { slug },
    });

    if (!cheatsheet || cheatsheet.status === "DELETED") {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    // Increment viewCount
    const updated = await prisma.cheatsheet.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
      include: {
        author: { select: { fullName: true, avatarUrl: true } },
        sections: {
          orderBy: { order: "asc" },
          include: { subsections: { orderBy: { order: "asc" } } }
        }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch cheatsheet" }, { status: 500 });
  }
}

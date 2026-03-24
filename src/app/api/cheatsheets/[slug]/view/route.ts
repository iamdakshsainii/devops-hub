import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const cheatsheet = await prisma.cheatsheet.findUnique({
      where: { slug },
    });

    if (!cheatsheet || cheatsheet.status === "DELETED") {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    const updated = await prisma.cheatsheet.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true } // only select increment output
    });

    return NextResponse.json({ message: "View incremented", viewCount: updated.viewCount });
  } catch (error) {
    return NextResponse.json({ message: "Failed to increment view" }, { status: 500 });
  }
}

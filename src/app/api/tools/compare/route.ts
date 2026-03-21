import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const comparisons = await prisma.toolComparison.findMany({
      where: { status: "PUBLISHED" },
      include: {
         toolA: { select: { name: true, slug: true, icon: true, category: true } },
         toolB: { select: { name: true, slug: true, icon: true, category: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(comparisons);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch comparisons" }, { status: 500 });
  }
}

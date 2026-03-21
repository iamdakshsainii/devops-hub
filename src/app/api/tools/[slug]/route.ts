import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const tool = await prisma.tool.findUnique({ where: { slug } });
    if (!tool || tool.status === "DELETED") {
       return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    const comparisons = await prisma.toolComparison.findMany({
       where: {
          OR: [{ toolAId: tool.id }, { toolBId: tool.id }],
          status: "PUBLISHED"
       },
       include: {
          toolA: { select: { name: true, slug: true, icon: true } },
          toolB: { select: { name: true, slug: true, icon: true } }
       }
    });

    const formatted = {
        ...tool,
        pros: tool.pros ? JSON.parse(tool.pros) : [],
        cons: tool.cons ? JSON.parse(tool.cons) : [],
        useCases: tool.useCases ? JSON.parse(tool.useCases) : []
    };

    return NextResponse.json({ tool: formatted, comparisons });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch tool" }, { status: 500 });
  }
}

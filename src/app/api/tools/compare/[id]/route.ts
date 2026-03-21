import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const comp = await prisma.toolComparison.findUnique({
      where: { id },
      include: {
         toolA: true,
         toolB: true
      }
    });

    if (!comp || comp.status === "DELETED") {
       return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    const formatted = {
        ...comp,
        criteria: comp.criteria ? JSON.parse(comp.criteria) : [],
        toolA: comp.toolA ? {
            ...comp.toolA,
            pros: comp.toolA.pros ? JSON.parse(comp.toolA.pros) : [],
            cons: comp.toolA.cons ? JSON.parse(comp.toolA.cons) : [],
            useCases: comp.toolA.useCases ? JSON.parse(comp.toolA.useCases) : []
        } : null,
        toolB: comp.toolB ? {
            ...comp.toolB,
            pros: comp.toolB.pros ? JSON.parse(comp.toolB.pros) : [],
            cons: comp.toolB.cons ? JSON.parse(comp.toolB.cons) : [],
            useCases: comp.toolB.useCases ? JSON.parse(comp.toolB.useCases) : []
        } : null
    };

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch comparison" }, { status: 500 });
  }
}

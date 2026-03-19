import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const event = await prisma.event.update({
      where: { id },
      data: { interestedCount: { increment: 1 } }
    });
    return NextResponse.json({ message: "Marked as interested", count: event.interestedCount });
  } catch (error) {
    return NextResponse.json({ message: "Failed to mark interested" }, { status: 500 });
  }
}


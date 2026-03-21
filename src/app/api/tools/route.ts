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
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } }
      ];
    }

    const tools = await prisma.tool.findMany({
      where,
      orderBy: { name: "asc" }
    });

    return NextResponse.json(tools);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch tools" }, { status: 500 });
  }
}

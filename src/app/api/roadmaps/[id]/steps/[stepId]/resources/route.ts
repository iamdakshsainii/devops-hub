import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { stepId } = await params;
  try {
    const resources = await prisma.roadmapResource.findMany({
      where: { stepId },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching resources" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { stepId } = await params;
  const { title, url, type, description, order } = await req.json();

  if (!title || !url) {
    return NextResponse.json({ message: "Title and URL are required" }, { status: 400 });
  }

  try {
    const resource = await prisma.roadmapResource.create({
      data: {
        title,
        url,
        type: type || "ARTICLE",
        description,
        order: order || 0,
        stepId,
      },
    });
    return NextResponse.json(resource);
  } catch (error) {
    return NextResponse.json({ message: "Error creating resource" }, { status: 500 });
  }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string; stepId: string }> }
  ) {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  
    const { resourceId, ...data } = await req.json();
    if (!resourceId) return NextResponse.json({ message: "Resource ID is required" }, { status: 400 });
  
    try {
      const resource = await prisma.roadmapResource.update({
        where: { id: resourceId },
        data,
      });
      return NextResponse.json(resource);
    } catch (error) {
      return NextResponse.json({ message: "Error updating resource" }, { status: 500 });
    }
  }

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { resourceId } = await req.json();
  if (!resourceId) return NextResponse.json({ message: "Resource ID is required" }, { status: 400 });

  try {
    await prisma.roadmapResource.delete({
      where: { id: resourceId },
    });
    return NextResponse.json({ message: "Resource deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting resource" }, { status: 500 });
  }
}

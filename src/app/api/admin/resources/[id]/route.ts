import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(resource);
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { title, description, type, url, tags, imageUrl, status, linkedStepId } = await req.json();

    // Update the global Resource row
    const resource = await prisma.resource.update({
      where: { id },
      data: {
        title,
        description,
        type,
        url,
        tags: tags || "General",
        imageUrl: imageUrl || null,
        status: status || "PUBLISHED",
      },
    });

    if (linkedStepId) {
      const existing = await prisma.roadmapResource.findFirst({
        where: { globalResourceId: id, stepId: linkedStepId }
      });
      if (!existing) {
        await prisma.roadmapResource.create({
          data: {
            stepId: linkedStepId,
            globalResourceId: id,
            title, url, type, description: description || null, imageUrl: imageUrl || null
          }
        });
      }
    }




    // Sync the edit back to the linked RoadmapResource row (if any).
    // This keeps the module viewer in sync with admin edits.
    await prisma.roadmapResource.updateMany({
      where: { globalResourceId: id },
      data: {
        title,
        url,
        type,
        description: description || null,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json({ message: "Updated", resource });
  } catch {
    return NextResponse.json({ message: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Soft delete — sets status to DELETED so it disappears from public view
    // and appears in the recycle bin. The RoadmapResource mirror row is left
    // intact so the module editor still shows it (admins can restore later).
    await prisma.resource.update({
      where: { id },
      data: { status: "DELETED" },
    });

    return NextResponse.json({ message: "Moved to recycle bin" });
  } catch {
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}

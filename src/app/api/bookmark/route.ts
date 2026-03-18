import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { itemId, itemType } = await req.json();

    const existing = await prisma.bookmark.findFirst({
      where: { userId: session.user.id, itemType, ...(itemType === "NOTE" ? { noteId: itemId } : { resourceId: itemId }) }
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ message: "Bookmark removed", status: "removed" });
    } else {
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          itemType,
          noteId: itemType === "NOTE" ? itemId : null,
          resourceId: itemType === "RESOURCE" ? itemId : null,
        }
      });
      return NextResponse.json({ message: "Bookmarked", status: "added" });
    }
  } catch (error) {
    return NextResponse.json({ message: "Error processing bookmark" }, { status: 500 });
  }
}

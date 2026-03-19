import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { itemId, itemType } = await req.json();

    const existing = await prisma.upvote.findFirst({
      where: { 
         userId: session.user.id, 
         itemType, 
         ...(itemType === "NOTE" ? { noteId: itemId } : itemType === "MODULE" ? { stepId: itemId } : { resourceId: itemId }) 
      }
    });

    if (existing) {
      await prisma.upvote.delete({ where: { id: existing.id } });
      return NextResponse.json({ message: "Upvote removed", status: "removed" });
    } else {
      await prisma.upvote.create({
        data: {
          userId: session.user.id,
          itemType,
          noteId: itemType === "NOTE" ? itemId : null,
          resourceId: itemType === "RESOURCE" ? itemId : null,
          stepId: itemType === "MODULE" ? itemId : null,
        }
      });
      return NextResponse.json({ message: "Upvoted", status: "added" });
    }
  } catch (error) {
    return NextResponse.json({ message: "Error processing upvote" }, { status: 500 });
  }
}

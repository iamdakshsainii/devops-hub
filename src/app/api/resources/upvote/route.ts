import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { resourceId } = await req.json();
    if (!resourceId) {
      return NextResponse.json({ message: "ResourceId required" }, { status: 400 });
    }

    // Check if the user already upvoted
    const existingUpvote = await prisma.upvote.findFirst({
      where: {
        userId: session.user.id,
        resourceId: resourceId,
        itemType: "RESOURCE",
      },
    });

    if (existingUpvote) {
      // Toggle off — delete the upvote
      await prisma.upvote.delete({
        where: { id: existingUpvote.id },
      });
      return NextResponse.json({ upvoted: false, message: "Upvote removed" });
    } else {
      // Create new upvote
      await prisma.upvote.create({
        data: {
          userId: session.user.id,
          resourceId: resourceId,
          itemType: "RESOURCE",
        },
      });
      return NextResponse.json({ upvoted: true, message: "Upvote added" });
    }
  } catch (error) {
    console.error("Upvote error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

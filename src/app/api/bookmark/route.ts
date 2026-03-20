import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { itemId, itemType, remindMe } = await req.json();

    if (!itemId || !itemType)
      return NextResponse.json({ message: "Missing itemId or itemType" }, { status: 400 });

    const whereClause = {
      userId: session.user.id,
      itemType,
      ...(itemType === "NOTE" ? { noteId: itemId } :
        itemType === "MODULE" ? { stepId: itemId } :
          itemType === "EVENT" ? { eventId: itemId } :
            itemType === "TOOL" ? { toolId: itemId } :
              itemType === "CERT" ? { certId: itemId } :
                { resourceId: itemId }),
    };

    const existing = await prisma.bookmark.findFirst({ where: whereClause });

    // --- Remind Me toggle on existing bookmark ---
    if (existing && remindMe !== undefined) {
      // If remindMe is being toggled on an existing bookmark, just update the flag
      const updated = await prisma.bookmark.update({
        where: { id: existing.id },
        data: { remindMe: Boolean(remindMe) },
      });
      return NextResponse.json({ message: "Reminder updated", status: "updated", remindMe: updated.remindMe });
    }

    // --- Save toggle (no remindMe flag sent) ---
    if (existing && remindMe === undefined) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ message: "Bookmark removed", status: "removed" });
    }

    // --- Create new bookmark ---
    const created = await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        itemType,
        remindMe: Boolean(remindMe),
        noteId: itemType === "NOTE" ? itemId : null,
        resourceId: itemType === "RESOURCE" ? itemId : null,
        stepId: itemType === "MODULE" ? itemId : null,
        eventId: itemType === "EVENT" ? itemId : null,
        toolId: itemType === "TOOL" ? itemId : null,
        certId: itemType === "CERT" ? itemId : null,
      },
    });

    return NextResponse.json({
      message: remindMe ? "Reminder set" : "Bookmarked",
      status: "added",
      remindMe: created.remindMe,
    });
  } catch (error) {
    console.error("Bookmark error:", error);
    return NextResponse.json({ message: "Error processing bookmark" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const itemType = searchParams.get("itemType");

    if (!itemId || !itemType)
      return NextResponse.json({ message: "Missing params" }, { status: 400 });

    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: session.user.id,
        itemType,
        ...(itemType === "NOTE" ? { noteId: itemId } :
          itemType === "MODULE" ? { stepId: itemId } :
            itemType === "EVENT" ? { eventId: itemId } :
              itemType === "TOOL" ? { toolId: itemId } :
                itemType === "CERT" ? { certId: itemId } :
                  { resourceId: itemId }),
      },
    });

    return NextResponse.json({
      saved: !!bookmark,
      remindMe: bookmark?.remindMe ?? false,
    });
  } catch (error) {
    console.error("Bookmark GET error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

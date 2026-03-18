import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { itemId, itemType, status } = await req.json();

    if (!["PUBLISHED", "REJECTED"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    let updatedItem: any;
    let title = "";

    if (itemType === "NOTE") {
      updatedItem = await prisma.note.update({ where: { id: itemId }, data: { status }, include: { author: true } });
      title = updatedItem.title;
    } else if (itemType === "RESOURCE") {
      updatedItem = await prisma.resource.update({ where: { id: itemId }, data: { status }, include: { author: true } });
      title = updatedItem.title;
    } else if (itemType === "EVENT") {
      updatedItem = await prisma.event.update({ where: { id: itemId }, data: { status }, include: { author: true } });
      title = updatedItem.title;
    } else {
      return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    if (updatedItem?.authorId) {
      await prisma.notification.create({
        data: {
          userId: updatedItem.authorId,
          type: "APPROVAL",
          title: status === "PUBLISHED" ? "Submission Approved" : "Submission Declined",
          message: `Your ${itemType.toLowerCase()} "${title}" has been ${status.toLowerCase()}${status === "PUBLISHED" ? " and is now live!" : "."}`,
          link: status === "PUBLISHED" ? `/${itemType.toLowerCase()}s/${updatedItem.id}` : undefined,
        }
      });
    }

    return NextResponse.json({ message: "Item status updated" });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

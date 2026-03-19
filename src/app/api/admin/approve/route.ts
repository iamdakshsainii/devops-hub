import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { itemId, itemType, status } = await req.json();

    // Fetch user from DB to check explicit permissions
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { permissions: true, role: true } });
    const isSuper = dbUser?.role === "SUPER_ADMIN";
    const perms = dbUser?.permissions || "";

    if (!isSuper) {
      if (itemType === "NOTE" && !perms.includes("MANAGE_NOTES")) return NextResponse.json({ message: "Missing MANAGE_NOTES permission" }, { status: 403 });
      if (itemType === "RESOURCE" && !perms.includes("MANAGE_RESOURCES")) return NextResponse.json({ message: "Missing MANAGE_RESOURCES permission" }, { status: 403 });
      if (itemType === "EVENT" && !perms.includes("MANAGE_EVENTS")) return NextResponse.json({ message: "Missing MANAGE_EVENTS permission" }, { status: 403 });
    }

    if (!["PUBLISHED", "REJECTED", "DELETED", "PENDING"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    if (status === "DELETED") {
       if (itemType === "NOTE") await prisma.note.delete({ where: { id: itemId } });
       else if (itemType === "RESOURCE") await prisma.resource.delete({ where: { id: itemId } });
       else if (itemType === "EVENT") await prisma.event.delete({ where: { id: itemId } });
       
       return NextResponse.json({ message: "Item deleted permanently" });
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
      if (status === "PUBLISHED") {
        await prisma.user.update({
          where: { id: updatedItem.authorId },
          data: { score: { increment: 10 } }
        });
      }

      await prisma.notification.create({
        data: {
          userId: updatedItem.authorId,
          type: "APPROVAL",
          title: status === "PUBLISHED" ? "Submission Approved (+10 Credits)" : "Submission Declined",
          message: `Your ${itemType.toLowerCase()} "${title}" has been ${status.toLowerCase()}${status === "PUBLISHED" ? " and is now live! You earned 10 credits." : "."}`,
          link: status === "PUBLISHED" ? `/${itemType.toLowerCase()}s/${updatedItem.id}` : undefined,
        }
      });
    }

    return NextResponse.json({ message: "Item status updated" });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

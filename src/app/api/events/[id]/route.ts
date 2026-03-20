import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const { status, note, title, description, type, startTime, externalLink, imageUrls, tags } = await req.json();

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role);
    const isAuthor = existingEvent.authorId === session.user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let updateData: any = {};
    if (isAdmin) {
      updateData.status = status || "PUBLISHED";
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (type) updateData.type = type;
      if (startTime) updateData.startTime = new Date(startTime);
      if (externalLink !== undefined) updateData.externalLink = externalLink;
      if (imageUrls !== undefined) updateData.imageUrls = imageUrls;
      if (tags !== undefined) updateData.tags = tags;

      if (note) {
        let history: any[] = [];
        const evt: any = existingEvent;
        try { history = JSON.parse(evt.feedback || "[]") } catch {
          if (evt.feedback) history = [{ note: evt.feedback, timestamp: new Date().toLocaleDateString() }];
        }
        history.push({ note, timestamp: new Date().toLocaleString() });
        updateData.feedback = JSON.stringify(history);
      }
    } else if (isAuthor) {
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (type) updateData.type = type;
      if (startTime) updateData.startTime = new Date(startTime);
      if (externalLink !== undefined) updateData.externalLink = externalLink;
      if (imageUrls !== undefined) updateData.imageUrls = imageUrls;
      if (tags !== undefined) updateData.tags = tags;
      updateData.status = "PENDING";
      updateData.feedback = null; // Clear feedback on resubmission
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData
    });

    if (isAdmin && (status === "PUBLISHED" || (!status && event.status === "PUBLISHED"))) {
      const users = await prisma.user.findMany({ select: { id: true } });
      if (users.length > 0) {
        await prisma.notification.createMany({
          data: users.map(u => ({
            userId: u.id,
            type: "APPROVAL",
            title: "🎉 New Event Live!",
            message: `Event "${event.title}" has been approved. Join now!`,
            link: `/events`
          }))
        });
      }
    }
    else if (isAdmin && status === "REJECTED" && note && event.authorId) {
      await prisma.notification.create({
        data: {
          userId: event.authorId,
          type: "REVISION",
          title: "📝 Revision Requested on Event",
          message: `Note: "${note}"`,
          link: `/events/dashboard`
        }
      });
    } else if (isAuthor && event.authorId) {
      const admins = await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
        select: { id: true }
      });
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map(admin => ({
            userId: admin.id,
            type: "NEW_SUBMISSION",
            title: "🔔 Event Resubmitted for Approval",
            message: `${session.user.name || "User"} resubmitted details for "${event.title}".`,
            link: `/admin/events`
          }))
        });
      }
    }

    return NextResponse.json({ message: "Updated", event });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ message: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role);
    const isAuthor = existing.authorId === session.user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.event.update({
      where: { id },
      data: { status: "DELETED" }
    });

    return NextResponse.json({ message: "Soft Deleted" });
  } catch { return NextResponse.json({ message: "Failed to delete" }, { status: 500 }); }
}

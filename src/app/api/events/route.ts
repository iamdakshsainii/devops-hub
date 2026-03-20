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

    const { title, description, type, startTime, endTime, externalLink, imageUrls, tags } = await req.json();

    if (!title || !description || !type || !startTime) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const status = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role) ? "PUBLISHED" : "PENDING";

    const event = await prisma.event.create({
      data: {
        title,
        description,
        type,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        externalLink: externalLink || null,
        imageUrls: imageUrls || null,
        tags: tags || "",
        authorId: session.user.id,
        status,
      } as any,
    });

    if (status === "PENDING") {
      const admins = await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
        select: { id: true },
      });
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: "NEW_SUBMISSION",
            title: "New Event Submission",
            message: `${session.user.name || "A user"} submitted "${title}" for review.`,
            link: "/admin/events",
          })),
        });
      }
    }

    return NextResponse.json({ message: "Event submitted successfully", event }, { status: 201 });
  } catch (error) {
    console.error("Event POST error:", error);
    return NextResponse.json({ message: "Failed to submit event" }, { status: 500 });
  }
}

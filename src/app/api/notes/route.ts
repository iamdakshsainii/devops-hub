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

    const { title, content, coverImage, tags, readTime } = await req.json();

    if (!title || !content || !tags) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Role-based publishing
    const status = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role) ? "PUBLISHED" : "PENDING";

    const note = await prisma.note.create({
      data: {
        title,
        content,
        coverImage,
        tags,
        readTime: readTime || Math.ceil(content.split(" ").length / 200), // ~200 WPM
        authorId: session.user.id,
        status,
      },
    });

    if (status === "PENDING") {
      const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map(admin => ({
            userId: admin.id,
            type: "NEW_SUBMISSION",
            title: "New Note Submission",
            message: `${session.user.name || "A user"} submitted a note "${title}" for review.`,
            link: "/admin/notes"
          }))
        });
      }
    }

    return NextResponse.json({ message: "Note submitted successfully", note }, { status: 201 });
  } catch (error) {
    console.error("Note submission error:", error);
    return NextResponse.json({ message: "Failed to submit note" }, { status: 500 });
  }
}

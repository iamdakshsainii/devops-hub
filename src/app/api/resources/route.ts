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

    const { title, description, type, url, tags, imageUrl } = await req.json();

    if (!title || !description || !type || !url || !tags) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Admin auto-publish
    const status = session.user.role === "ADMIN" ? "PUBLISHED" : "PENDING";

    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        type, 
        url,
        tags,
        imageUrl: imageUrl || null,
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
            title: "New Resource Submission",
            message: `${session.user.name || "A user"} submitted a resource "${title}" for review.`,
            link: "/admin/resources"
          }))
        });
      }
    }

    return NextResponse.json({ message: "Resource submitted successfully", resource }, { status: 201 });
  } catch (error) {
    console.error("Resource submission error:", error);
    return NextResponse.json({ message: "Failed to submit resource" }, { status: 500 });
  }
}

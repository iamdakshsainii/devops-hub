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

    const { title, description, type, url, tags, imageUrl } = await req.json();

    if (!title || !description || !type || !url) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        type, 
        url,
        tags: tags || "General",
        imageUrl: imageUrl || null,
        authorId: session.user.id,
        status: "PUBLISHED", // Admin creators always live
      },
    });

    return NextResponse.json({ message: "Created", resource }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create" }, { status: 500 });
  }
}

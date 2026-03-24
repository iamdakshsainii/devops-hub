import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resources = await prisma.resource.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, type, url, tags, imageUrl, linkedStepId } = await req.json();

    if (!title || !type || !url) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }


    const resource = await prisma.$transaction(async (tx) => {
      const r = await tx.resource.create({
        data: {
          title,
          description,
          type,
          url,
          tags: tags || "General",
          imageUrl: imageUrl || null,
          authorId: session.user.id,
          status: "PUBLISHED",
        },
      });

      if (linkedStepId) {
        await tx.roadmapResource.create({
          data: {
            stepId: linkedStepId,
            title: title || "Module Resource",
            url: url || "",
            type: type || "ARTICLE",
            description: description || "",
            imageUrl: imageUrl || null,
            globalResourceId: r.id,
          }
        });
      }



      return r;
    });

    return NextResponse.json({ message: "Created", resource }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: "Failed to create" }, { status: 500 });
  }
}

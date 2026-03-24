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

    const cheatsheets = await prisma.cheatsheet.findMany({
      where: {
        status: { not: "DELETED" },
      },
      include: {
        author: {
          select: {
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: { sections: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cheatsheets);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch cheatsheets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { 
      title, slug, description, category, icon, 
      difficulty, readTime, coverImage, tags, status, 
      sections 
    } = await req.json();

    if (!title || !slug || !category) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check slug collision
    const existing = await prisma.cheatsheet.findUnique({ where: { slug } });
    if (existing) {
       return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
    }

    const cheatsheet = await prisma.$transaction(async (tx) => {
      const createdCheatsheet = await tx.cheatsheet.create({
        data: {
          title,
          slug,
          description: description || null,
          category,
          icon: icon || "📋",
          difficulty: difficulty || "BEGINNER",
          readTime: readTime ? Number(readTime) : 10,
          coverImage: coverImage || null,
          tags: tags || null,
          status: status || "DRAFT",
          authorId: session.user.id
        }
      });

      if (sections && Array.isArray(sections)) {
        for (const sec of sections) {
          const createdSec = await tx.cheatsheetSection.create({
            data: {
              title: sec.title,
              order: sec.order || 0,
              cheatsheetId: createdCheatsheet.id
            }
          });

          if (sec.subsections && Array.isArray(sec.subsections)) {
             await tx.cheatsheetSubsection.createMany({
                data: sec.subsections.map((sub: any) => ({
                    title: sub.title,
                    content: sub.content,
                    order: sub.order || 0,
                    sectionId: createdSec.id
                }))
             });
          }
        }
      }
      return createdCheatsheet;
    }, { timeout: 60000 });

    return NextResponse.json({ message: "Created", cheatsheet }, { status: 201 });
  } catch (error) {
    console.error("Create cheatsheet failed:", error);
    return NextResponse.json({ message: "Failed to create", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}


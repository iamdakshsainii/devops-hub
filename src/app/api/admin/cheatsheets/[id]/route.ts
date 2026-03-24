import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Single Cheatsheet
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const cheatsheet = await prisma.cheatsheet.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: { subsections: { orderBy: { order: "asc" } } },
        },
      },
    });

    if (!cheatsheet) {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(cheatsheet);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 });
  }
}

// PUT - Update Cheatsheet
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { 
      title, slug, description, category, icon, 
      difficulty, readTime, coverImage, tags, status, 
      sections 
    } = await req.json();

    const existing = await prisma.cheatsheet.findUnique({ where: { id } });
    if (!existing) {
       return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const cheatsheet = await tx.cheatsheet.update({
        where: { id },
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
          status: status || existing.status,
        }
      });

      if (sections && Array.isArray(sections)) {
         // Delete all sections - cascade deletes subsections
         await tx.cheatsheetSection.deleteMany({ where: { cheatsheetId: id } });

         for (const sec of sections) {
            const createdSec = await tx.cheatsheetSection.create({
              data: {
                title: sec.title,
                order: sec.order || 0,
                cheatsheetId: id
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
      return cheatsheet;
    }, { timeout: 60000 });

    return NextResponse.json({ message: "Updated", cheatsheet: updated });
  } catch (error) {
    console.error("Update cheatsheet failed:", error);
    return NextResponse.json({ message: "Failed to update", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// DELETE - Soft Delete
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updated = await prisma.cheatsheet.update({
       where: { id },
       data: { status: "DELETED" }
    });

    return NextResponse.json({ message: "Soft deleted", cheatsheet: updated });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}

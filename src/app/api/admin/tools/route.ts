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

    const { 
      name, slug, description, category, icon, 
      logoUrl, docsUrl, githubUrl, difficulty, license, 
      tags, pros, cons, useCases, status,
      moduleUrl, resourceUrl 
    } = await req.json();

    if (!name || !slug || !description || !category) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check slug collision
    const existing = await prisma.tool.findUnique({ where: { slug } });
    if (existing) {
       return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
    }

    const tool = await prisma.tool.create({
      data: {
        name,
        slug,
        description,
        category,
        icon: icon || "🔧",
        logoUrl: logoUrl || null,
        docsUrl: docsUrl || null,
        githubUrl: githubUrl || null,
        difficulty: difficulty || "BEGINNER",
        license: license || "Open Source",
        tags: tags || null,
        moduleUrl: moduleUrl || null,
        resourceUrl: resourceUrl || null,
        authorId: (session as any).user.id,
        // Stringify arrays
        pros: pros ? JSON.stringify(pros) : null,
        cons: cons ? JSON.stringify(cons) : null,
        useCases: useCases ? JSON.stringify(useCases) : null,
        status: status || "PUBLISHED"
      }
    });

    return NextResponse.json({ message: "Created", tool }, { status: 201 });
  } catch (error) {
    console.error("Create tool failure:", error);
    return NextResponse.json({ message: "Failed to create" }, { status: 500 });
  }
}

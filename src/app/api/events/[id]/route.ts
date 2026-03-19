import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { status } = await req.json();

    const event = await prisma.event.update({
      where: { id },
      data: { status: status || "PUBLISHED" }
    });

    return NextResponse.json({ message: "Updated", event });
  } catch { return NextResponse.json({ message: "Failed to update" }, { status: 500 }); }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const event = await prisma.event.update({
      where: { id },
      data: { status: "DELETED" }
    });

    return NextResponse.json({ message: "Soft Deleted" });
  } catch { return NextResponse.json({ message: "Failed to delete" }, { status: 500 }); }
}

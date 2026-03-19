import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    // Only SUPER_ADMIN can modify general roles/permissions streams
    if (!session || session.user.role !== "SUPER_ADMIN") {
       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role, permissions } = await req.json();

    await prisma.user.update({
         where: { id },
         data: { role, permissions }
    });

    return NextResponse.json({ message: "Updated" });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    const { action } = await req.json();

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const adminReq = await prisma.adminRequest.findUnique({ where: { id } });
    const contactReq = await prisma.contactRequest.findUnique({ where: { id } });

    if (adminReq) {
        if (action === "APPROVE") {
           await prisma.user.update({ where: { id: adminReq.userId }, data: { role: "ADMIN" } });
           await prisma.adminRequest.update({ where: { id }, data: { status: "APPROVED" } });
        } else {
           await prisma.adminRequest.update({ where: { id }, data: { status: "REJECTED" } });
        }
    } else if (contactReq) {
       await prisma.contactRequest.update({ where: { id }, data: { status: "READ" } });
    }

    return NextResponse.json({ message: "Action successful" });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

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

    const { reason } = await req.json();

    const existingRequest = await prisma.adminRequest.findFirst({
      where: { userId: session.user.id, status: "PENDING" }
    });

    if (existingRequest) {
      return NextResponse.json({ message: "You already have a pending request" }, { status: 400 });
    }

    await prisma.adminRequest.create({
      data: {
        userId: session.user.id,
        reason,
        status: "PENDING"
      }
    });

    // Notify SUPER_ADMINs
    const superAdmins = await prisma.user.findMany({ where: { role: "SUPER_ADMIN" } });
    if (superAdmins.length > 0) {
      await prisma.notification.createMany({
        data: superAdmins.map(admin => ({
          userId: admin.id,
          type: "SYSTEM",
          title: "New Admin Request",
          message: `${session.user.name || "A user"} has requested admin privileges.`,
          link: "/admin/roles"
        }))
      });
    }

    return NextResponse.json({ message: "Request submitted" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

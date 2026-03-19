import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json();

    await prisma.user.update({
         where: { id: userId },
         data: { role: "MEMBER", permissions: null }
    });

    await prisma.notification.create({
         data: {
             userId,
             type: "SYSTEM",
             title: "Account Privileges Updated",
             message: "Your administrator permissions have been removed."
         }
    });

    return NextResponse.json({ message: "Demoted" });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

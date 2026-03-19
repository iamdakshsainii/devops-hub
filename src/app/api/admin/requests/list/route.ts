import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "admin") {
      const data = await prisma.adminRequest.findMany({
         include: { user: true },
         orderBy: { createdAt: "desc" }
      });
      return NextResponse.json(data);
    } else {
      const data = await prisma.contactRequest.findMany({
         orderBy: { createdAt: "desc" }
      });
      return NextResponse.json(data);
    }
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

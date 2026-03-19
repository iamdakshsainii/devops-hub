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

    const { id, type, action } = await req.json();

    if (action === "restore") {
        if (type === "MODULE") {
             await prisma.roadmapStep.update({ where: { id }, data: { status: "PENDING" } });
        } else if (type === "RESOURCE") {
             await prisma.resource.update({ where: { id }, data: { status: "PENDING" } });
        }
    } else if (action === "purge") {
        if (type === "MODULE") {
             await prisma.roadmapStep.delete({ where: { id } });
        } else if (type === "RESOURCE") {
             await prisma.resource.delete({ where: { id } });
        }
    }

    return NextResponse.json({ message: "Success" });
  } catch (err) {
    return NextResponse.json({ message: "Failed operation" }, { status: 500 });
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { reason, category } = await req.json();

    const existing = await prisma.adminRequest.findFirst({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" }
    });

    if (existing) {
       const daysPassed = (Date.now() - new Date(existing.updatedAt).getTime()) / (1000*60*60*24);
       
       const setting = await prisma.systemSetting.findUnique({ where: { key: "COOLDOWN_DAYS" } });
       const waitDays = parseInt(setting?.value || "7");

       if (existing.status === "PENDING") {
          return NextResponse.json({ message: "Request feels already pending setup." }, { status: 400 });
       }
       if (existing.status === "REJECTED" && daysPassed < waitDays) {
          return NextResponse.json({ message: `Cannot apply yet. Please wait ${Math.ceil(waitDays - daysPassed)} more days.` }, { status: 400 });
       }
    }

    await prisma.adminRequest.create({
         data: { userId: session.user.id, reason, category: category || "GENERAL", status: "PENDING" }
    });

    return NextResponse.json({ message: "Request received" });
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

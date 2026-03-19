import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ isBlocked: false });

    const existing = await prisma.adminRequest.findFirst({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" }
    });

    if (existing) {
       const daysPassed = (Date.now() - new Date(existing.updatedAt).getTime()) / (1000*60*60*24);
       
       const setting = await prisma.systemSetting.findUnique({ where: { key: "COOLDOWN_DAYS" } });
       const waitDays = parseInt(setting?.value || "7");

       if (existing.status === "PENDING") {
          return NextResponse.json({ isBlocked: true, message: "You already have a pending application under review." });
       }
       if (existing.status === "REJECTED" && daysPassed < waitDays) {
          const remaining = Math.ceil(waitDays - daysPassed);
          return NextResponse.json({ isBlocked: true, message: `Application locked. Please wait ${remaining} more day(s) due to cooldown.` });
       }
    }

    return NextResponse.json({ isBlocked: false });
  } catch {
    return NextResponse.json({ isBlocked: false });
  }
}

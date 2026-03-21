import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // assumed location of authOptions
import { prisma } from "@/lib/prisma"; // assumed location of prisma client

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const progress = await prisma.userProgress.findMany({
      where: { userId: session.user.id }
    });
    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId, itemType, completed } = await request.json();

  if (!itemId || !itemType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    if (completed === false) {
      await prisma.userProgress.deleteMany({
        where: { userId: session.user.id, itemId }
      });
    } else {
      const user = await prisma.user.findUnique({ select: { streak: true, streakLastUpdate: true }, where: { id: session.user.id } });
      let streak = user?.streak || 0;
      let streakLastUpdate = user?.streakLastUpdate || null;
      const now = new Date();

      if (streakLastUpdate) {
        const lastUpdateStr = new Date(streakLastUpdate).toDateString();
        const todayStr = now.toDateString();
        
        if (lastUpdateStr !== todayStr) {
           const yesterday = new Date(now);
           yesterday.setDate(yesterday.getDate() - 1);
           if (lastUpdateStr === yesterday.toDateString()) {
              streak += 1;
           } else {
              streak = 1;
           }
        }
      } else {
        streak = 1;
      }

      await prisma.$transaction([
        prisma.userProgress.upsert({
          where: { userId_itemId: { userId: session.user.id, itemId } },
          update: { completed: true },
          create: { userId: session.user.id, itemId, itemType, completed: true }
        }),
        prisma.user.update({
          where: { id: session.user.id },
          data: { streak, streakLastUpdate: now }
        })
      ]);
    }
    return NextResponse.json({ success: true, streakUpdated: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to sync progress" }, { status: 500 });
  }
}

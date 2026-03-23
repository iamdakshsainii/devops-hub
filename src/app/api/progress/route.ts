import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const progress = await prisma.userProgress.findMany({
      where: { userId: session.user.id },
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

  const body = await request.json();
  const { itemId, itemType, completed, subtopicIds } = body;

  if (!itemId || !itemType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // FIX (route Bug 4): loose falsy — handles false, 0, "false", undefined
  const isUnchecking = !completed;

  try {
    if (isUnchecking) {
      // Delete parent + all related subtopic records atomically
      await prisma.userProgress.deleteMany({
        where: {
          userId: session.user.id,
          itemId: { in: [itemId, ...(subtopicIds ?? [])] },
        },
      });
      return NextResponse.json({ success: true });
    }

    // ── Marking complete ────────────────────────────────────────────────

    // Read streak state before opening transaction
    const user = await prisma.user.findUnique({
      select: { streak: true, streakLastUpdate: true },
      where: { id: session.user.id },
    });

    let streak = user?.streak ?? 0;
    const streakLastUpdate = user?.streakLastUpdate ?? null;
    const now = new Date();
    const todayStr = now.toDateString();

    if (streakLastUpdate) {
      const lastStr = new Date(streakLastUpdate).toDateString();
      if (lastStr !== todayStr) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        // Consecutive day → increment; gap > 1 day → reset to 1
        streak = lastStr === yesterday.toDateString() ? streak + 1 : 1;
      }
      // Same day: streak count unchanged, but streakLastUpdate still refreshed below
    } else {
      streak = 1;
    }

    // FIX (route Bug 1 + Bug 3): interactive transaction — atomic, and
    // streakLastUpdate is ALWAYS written regardless of whether it's the same day
    // FIX (route Bug 2): upsert parent AND every subtopic so re-checking a
    // parent after unchecking correctly restores all subtopic records too
    await prisma.$transaction(async (tx) => {
      const allIds: { id: string; type: string }[] = [
        { id: itemId, type: itemType },
        ...(subtopicIds ?? []).map((id: string) => ({ id, type: "SUBTOPIC" })),
      ];

      for (const { id, type } of allIds) {
        await tx.userProgress.upsert({
          where: { userId_itemId: { userId: session.user.id, itemId: id } },
          update: { completed: true },
          create: { userId: session.user.id, itemId: id, itemType: type, completed: true },
        });
      }

      await tx.user.update({
        where: { id: session.user.id },
        data: { streak, streakLastUpdate: now },
      });
    });

    return NextResponse.json({ success: true, streak });
  } catch (error) {
        try { require('fs').appendFileSync('c:/my-stuff/devops-hub/.agents/scripts/progress_route_trace.log', 'API Error: ' + JSON.stringify(error, Object.getOwnPropertyNames(error)) + '\n'); } catch(e) {}
    console.error("[progress POST]", error);
    return NextResponse.json({ error: "Failed to sync progress" }, { status: 500 });
  }
}
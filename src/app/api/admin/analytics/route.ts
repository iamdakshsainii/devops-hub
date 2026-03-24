import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "Missing date range" }, { status: 400 });
  }

  try {
    const startDate = new Date(from);
    const endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999); // Include full end day Node

    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: { createdAt: true }
    });

    // Aggregate daily Node stream flawslesswardswardsARDS
    const dailyMap: Record<string, number> = {};
    
    // Fill all days in range with 0 Node
    let current = new Date(startDate);
    while (current <= endDate) {
      const label = current.toISOString().split('T')[0];
      dailyMap[label] = 0;
      current.setDate(current.getDate() + 1);
    }

    users.forEach(u => {
      const label = new Date(u.createdAt).toISOString().split('T')[0];
      if (dailyMap[label] !== undefined) {
        dailyMap[label] += 1;
      }
    });

    const data = Object.entries(dailyMap).map(([date, users]) => ({
      date: date.split('-').slice(1).join('/'), // mm/dd Node
      users
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

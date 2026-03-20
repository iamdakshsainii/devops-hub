import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id)
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const userId = session.user.id;

        // Get today's date range (midnight to midnight)
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        // Find all remindMe bookmarks for this user where the event is today
        const reminders = await prisma.bookmark.findMany({
            where: {
                userId,
                itemType: "EVENT",
                remindMe: true,
                event: {
                    startTime: { gte: todayStart, lte: todayEnd },
                    status: "PUBLISHED",
                },
            },
            include: {
                event: { select: { id: true, title: true, startTime: true, externalLink: true } },
            },
        });

        if (reminders.length === 0)
            return NextResponse.json({ message: "No reminders today", notified: 0 });

        // Idempotency — don't create duplicate notifications for same event on same day
        const existingNotifications = await prisma.notification.findMany({
            where: {
                userId,
                type: "REMINDER",
                createdAt: { gte: todayStart },
            },
            select: { message: true },
        });

        const alreadyNotifiedTitles = new Set(
            existingNotifications.map((n) => n.message)
        );

        const toNotify = reminders.filter(
            (r) => r.event && !alreadyNotifiedTitles.has(`"${r.event.title}" is happening today!`)
        );

        if (toNotify.length === 0)
            return NextResponse.json({ message: "Already notified today", notified: 0 });

        await prisma.notification.createMany({
            data: toNotify.map((r) => ({
                userId,
                type: "REMINDER",
                title: "📅 Event Reminder",
                message: `"${r.event!.title}" is happening today!`,
                link: r.event!.externalLink || "/events",
            })),
        });

        return NextResponse.json({ message: "Reminders sent", notified: toNotify.length });
    } catch (error) {
        console.error("Check reminders error:", error);
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}

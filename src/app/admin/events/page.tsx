import { prisma } from "@/lib/prisma";
import AdminEventsList from "./events-list";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const session = await getServerSession(authOptions);

  const events = await prisma.event.findMany({
    where: { status: { not: "DELETED" } },
    orderBy: { startTime: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Events Management ({events.length})
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage and approve community events.
        </p>
      </div>
      <AdminEventsList events={events} currentUserId={session?.user?.id} />
    </div>
  );
}

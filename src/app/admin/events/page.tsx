import { prisma } from "@/lib/prisma";
import AdminEventsList from "./events-list";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startTime: "asc" }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Events Management</h1>
        <p className="text-muted-foreground mt-1">Manage and view community events.</p>
      </div>

      <AdminEventsList events={events} />
    </div>
  );
}

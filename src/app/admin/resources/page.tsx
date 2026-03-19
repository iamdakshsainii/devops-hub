import { prisma } from "@/lib/prisma";
import AdminResourcesList from "./resources-list";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { fullName: true } } }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resources Direct Manager</h1>
        <p className="text-muted-foreground mt-1">Direct master panel managing global community submitted or admin reference links.</p>
      </div>

      <AdminResourcesList resources={resources} />
    </div>
  );
}

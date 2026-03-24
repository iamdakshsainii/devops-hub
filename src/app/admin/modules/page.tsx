import { prisma } from "@/lib/prisma";
import AdminModulesList from "./modules-list";

export const dynamic = "force-dynamic";

export default async function AdminModulesPage() {
  const modules = await prisma.roadmapStep.findMany({
    where: { roadmapId: null }, // Only list standalone items that acts as attached modules nodeswards downwards smoothly.
    orderBy: { createdAt: "desc" },
    include: {
      roadmap: { select: { title: true, color: true } },
      _count: { select: { topics: true, resources: true } }
    }
  });

  const roadmaps = await prisma.roadmap.findMany({
    where: { status: { not: "DELETED" } },
    select: { id: true, title: true }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Modules Manager</h1>
        <p className="text-muted-foreground mt-1">Manage individual teaching nodes, standalone topics & knowledge items.</p>
      </div>

      <AdminModulesList modules={modules} roadmaps={roadmaps} />
    </div>
  );
}

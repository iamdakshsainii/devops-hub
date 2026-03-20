import { prisma } from "@/lib/prisma";
import ModulesPageClient from "./modules-client";

export const dynamic = "force-dynamic";

export default async function ModulesPage() {
  const roadmaps = await prisma.roadmap.findMany({
    where: { status: "PUBLISHED" },
    include: {
      steps: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
        include: {
          _count: { select: { topics: true, resources: true } }
        }
      }
    }
  });

  const allModules = roadmaps.flatMap(roadmap => 
    roadmap.steps.map(step => ({
      id: step.id,
      title: step.title,
      description: step.description,
      icon: step.icon,
      order: step.order,
      roadmapId: roadmap.id,
      roadmapTitle: roadmap.title,
      roadmapColor: roadmap.color,
      _count: step._count
    }))
  );

  return <ModulesPageClient data={allModules} />;
}

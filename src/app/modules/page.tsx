import { prisma } from "@/lib/prisma";
import ModulesPageClient from "./modules-client";

export const dynamic = "force-dynamic";

export default async function ModulesPage() {
  // Fetch ALL published modules — standalone and roadmap-attached
  const steps = await prisma.roadmapStep.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: {
      roadmap: {
        select: { id: true, title: true, color: true, status: true }
      },
      _count: { select: { topics: true, resources: true } }
    }
  });

  const allModules = steps.map(step => ({
    id: step.id,
    title: step.title,
    description: step.description,
    icon: step.icon,
    order: step.order,
    createdAt: step.createdAt,
    // Only attach roadmap context if roadmap is published and not a dummy
    roadmapId: step.roadmap?.status === "PUBLISHED" ? step.roadmapId : null,
    roadmapTitle: step.roadmap?.status === "PUBLISHED" ? step.roadmap.title : null,
    roadmapColor: step.roadmap?.status === "PUBLISHED" ? step.roadmap.color : null,
    isStandalone: !step.roadmapId || step.roadmap?.status !== "PUBLISHED",
    tags: (step as any).tags || "",
    _count: step._count
  }));

  return <ModulesPageClient data={allModules} />;
}
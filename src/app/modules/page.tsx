import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ModulesPageClient from "./modules-client";

export const dynamic = "force-dynamic";

export default async function ModulesPage() {
  const session = await getServerSession(authOptions);
  
  const [steps, progress] = await Promise.all([
    prisma.roadmapStep.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      include: {
        roadmap: {
          select: { id: true, title: true, color: true, status: true }
        },
        topics: {
          select: {
            id: true,
            content: true,
            subtopics: { select: { id: true, content: true } }
          }
        },
        _count: { select: { topics: true, resources: true } }
      }
    }),
    session?.user?.id 
      ? prisma.userProgress.findMany({ where: { userId: session.user.id } })
      : []
  ]);

  const completedItemIds = new Set(progress.map((p: any) => p.itemId));

  const allModules = steps.map(step => {
    let trackingTotal = 0;
    let trackingCompleted = 0;
    
    for (const t of step.topics) {
      trackingTotal += 1;
      if (completedItemIds.has(t.id)) trackingCompleted += 1;
    }

    return {
      id: step.id,
      title: step.title,
      description: step.description,
      icon: step.icon,
      order: step.order,
      createdAt: step.createdAt,
      roadmapId: step.roadmap?.status === "PUBLISHED" ? step.roadmapId : null,
      roadmapTitle: step.roadmap?.status === "PUBLISHED" ? step.roadmap.title : null,
      roadmapColor: step.roadmap?.status === "PUBLISHED" ? step.roadmap.color : null,
      isStandalone: !step.roadmapId || step.roadmap?.status !== "PUBLISHED",
      tags: (step as any).tags || "",
      trackingTotal,
      trackingCompleted,
      _count: step._count
    };
  });

  return <ModulesPageClient data={allModules} />;
}
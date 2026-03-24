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
        attachedModules: {
          include: {
            module: {
              include: {
                topics: {
                  select: { id: true }
                },
                _count: { select: { topics: true, resources: true } }
              }
            }
          }
        },
        topics: {
          select: { id: true }
        },
        _count: { select: { topics: true, resources: true } }
      }
    }),
    session?.user?.id 
      ? prisma.userProgress.findMany({ where: { userId: session.user.id } })
      : []
  ]);

  const completedItemIds = new Set(progress.map((p: any) => p.itemId));

  const moduleMap = new Map<string, any>();

  for (const step of steps) {
    if (step.attachedModules && step.attachedModules.length > 0) {
      for (const att of step.attachedModules) {
        const mod = att.module;
        let trackingTotal = mod._count.topics;
        let trackingCompleted = 0;

        if (mod.topics) {
          for (const t of mod.topics) {
            if (completedItemIds.has(t.id)) trackingCompleted += 1;
          }
        }

        if (moduleMap.has(mod.id)) {
          const existing = moduleMap.get(mod.id);
          existing.steps.push({ id: step.id, title: step.title });
          if (!existing.roadmapTitle && step.roadmap?.title) {
             existing.roadmapTitle = step.roadmap.title;
             existing.roadmapId = step.roadmapId;
          }
        } else {
          moduleMap.set(mod.id, {
            id: mod.id,
            title: mod.title,
            description: mod.description,
            icon: mod.icon,
            order: mod.order,
            createdAt: mod.createdAt,
            roadmapId: step.roadmapId,
            roadmapTitle: step.roadmap?.title || null,
            isStandalone: false,
            tags: mod.tags || "",
            trackingTotal,
            trackingCompleted,
            _count: mod._count,
            steps: [{ id: step.id, title: step.title }]
          });
        }
      }
    }

    const isStandaloneCourse = !step.roadmapId && step._count.topics > 0;
    if (isStandaloneCourse) {
      let trackingTotal = step._count.topics;
      let trackingCompleted = 0;
      for (const t of step.topics) {
        if (completedItemIds.has(t.id)) trackingCompleted += 1;
      }

      if (moduleMap.has(step.id)) {
         const existing = moduleMap.get(step.id);
         existing.isStandalone = true;
      } else {
         moduleMap.set(step.id, {
           id: step.id,
           title: step.title,
           description: step.description,
           icon: step.icon,
           order: step.order,
           createdAt: step.createdAt,
           roadmapId: null,
           roadmapTitle: null,
           isStandalone: true,
           tags: step.tags || "",
           trackingTotal,
           trackingCompleted,
           _count: step._count,
           steps: [] as { id: string; title: string }[]
         });
      }
    }
  }

  const allModules = Array.from(moduleMap.values());

  return <ModulesPageClient data={allModules} />;
}
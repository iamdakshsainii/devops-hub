import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { StepModulesViewer } from "@/components/step-modules-viewer";

export const dynamic = "force-dynamic";

export default async function StepDetailPage({
  params,
}: {
  params: Promise<{ id: string; stepId: string }>;
}) {
  const { id, stepId } = await params;
  const session = await getServerSession(authOptions);

  const step = await prisma.roadmapStep.findFirst({
    where: { id: stepId },
    include: {
      resources: { orderBy: { order: "asc" } },
      attachedModules: {
        include: {
          module: {
            include: {
              topics: { select: { id: true } },
              _count: { select: { topics: true, resources: true } }
            }
          }
        },
        orderBy: { order: "asc" }
      },
      roadmap: true,
    }
  });

  if (!step || !step.roadmap) notFound();

  // Fetch completed topic IDs for this user
  let completedTopicIds: string[] = [];
  if (session?.user?.id) {
    const progress = await prisma.userProgress.findMany({
      where: { userId: session.user.id },
      select: { itemId: true }
    });
    completedTopicIds = progress.map(p => p.itemId);
  }

  const isProject = step.title.toLowerCase().includes("project") || step.title.toLowerCase().includes("capstone");
  const completedResourceIds = (step as any).resources?.filter((r: any) => completedTopicIds.includes(r.id)).map((r: any) => r.id) || [];
  const projectIsDone = isProject && completedResourceIds.length > 0;

  // Calculate completed topics count for each module
  const attachedModulesWithProgress = step.attachedModules.map((am: any) => {
     const topics: Array<{id: string}> = am.module.topics || [];
     const moduleTopicIds = topics.map((t) => t.id);
     const completedCount = moduleTopicIds.filter(tid => completedTopicIds.includes(tid)).length;
     
     return {
       ...am,
       module: {
         id: am.module.id,
         title: am.module.title,
         description: am.module.description,
         icon: am.module.icon,
         tags: am.module.tags,
         _count: am.module._count,
         completedCount,
         // Assuming 5 mins per topic for read time estimate
         readTime: (am.module._count?.topics || 0) * 5,
       }
     };
  });

  // Dynamic Progress Logic:
  // 1. Mandatory modules ALWAYS count towards the goal.
  // 2. Optional modules ONLY count towards the goal (and the total) if the user has started them (completedCount > 0).
  // This allows the progress bar to show 100% once required modules are done, unless the user chooses to "deep-dive".

  const totalTopics = attachedModulesWithProgress.reduce((sum, am) => {
    const isMandatory = !am.isOptional;
    const hasStartedOptional = am.isOptional && am.module.completedCount > 0;
    
    if (isMandatory || hasStartedOptional) {
      return sum + (am.module._count?.topics || 0);
    }
    return sum;
  }, 0);

  const completedTopics = attachedModulesWithProgress.reduce((sum, am) => {
    const isMandatory = !am.isOptional;
    const hasStartedOptional = am.isOptional && am.module.completedCount > 0;

    if (isMandatory || hasStartedOptional) {
      return sum + am.module.completedCount;
    }
    return sum;
  }, 0);

  const totalTopicsIncludingOptional = attachedModulesWithProgress.reduce((sum, am) => sum + (am.module._count?.topics || 0), 0);
  const completedTopicsIncludingOptional = attachedModulesWithProgress.reduce((sum, am) => sum + (am.module.completedCount), 0);

  // Get Adjacent Steps
  const siblings = await prisma.roadmapStep.findMany({
    where: { roadmapId: id },
    orderBy: { order: "asc" },
    select: { id: true }
  });

  const currentIndex = siblings.findIndex(s => s.id === stepId);
  const prevStepId = currentIndex > 0 ? siblings[currentIndex - 1].id : undefined;
  const nextStepId = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1].id : undefined;

  const finalTotalTopics = isProject ? 1 : totalTopicsIncludingOptional;
  const finalCompletedTopics = projectIsDone ? 1 : (isProject ? 0 : completedTopicsIncludingOptional);
  const finalPercent = projectIsDone ? 100 : (finalTotalTopics > 0 ? Math.round((finalCompletedTopics / finalTotalTopics) * 100) : 0);

  const stats = {
    totalModules: attachedModulesWithProgress.length,
    totalTopics: finalTotalTopics,
    completedTopics: finalCompletedTopics,
    percentComplete: finalPercent,
    completedResourceIds
  };

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  return (
    <StepModulesViewer
      isAdmin={isAdmin}
      step={{
        id: step.id,
        title: step.title,
        description: step.description,
        icon: step.icon,
        attachedModules: attachedModulesWithProgress,
        resources: (step as any).resources || []
      }}
      roadmap={{
        id: step.roadmap.id,
        title: step.roadmap.title,
        color: step.roadmap.color,
        icon: step.roadmap.icon
      }}
      prevStepId={prevStepId}
      nextStepId={nextStepId}
      stats={stats}
    />
  );
}
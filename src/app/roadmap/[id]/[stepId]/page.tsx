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

  // Calculate overall stats for the step (Excluding Optional for the percentage)
  const totalTopics = attachedModulesWithProgress.reduce((sum, am) => sum + (am.isOptional ? 0 : (am.module._count?.topics || 0)), 0);
  const completedTopics = attachedModulesWithProgress.reduce((sum, am) => sum + (am.isOptional ? 0 : (am.module.completedCount)), 0);
  
  // Also calculate total including optional for the "items" count if needed, or just keep it simple.
  // The user wants to know they reached 100% without optional.
  
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

  const stats = {
    totalModules: attachedModulesWithProgress.length,
    totalTopics: totalTopicsIncludingOptional,
    completedTopics: completedTopicsIncludingOptional,
    percentComplete: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
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
        attachedModules: attachedModulesWithProgress
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
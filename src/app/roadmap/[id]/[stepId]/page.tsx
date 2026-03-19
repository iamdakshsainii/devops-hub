import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StepViewer } from "@/components/step-viewer";

export const dynamic = "force-dynamic";

export default async function StepDetailPage({ params }: { params: Promise<{ id: string, stepId: string }> }) {
  const { id, stepId } = await params;

  const roadmap = await prisma.roadmap.findUnique({
    where: { id },
    include: {
      steps: {
        where: { id: stepId },
        include: {
          topics: { 
            orderBy: { order: "asc" },
            include: { subtopics: { orderBy: { order: "asc" } } }
          },
          resources: { orderBy: { order: "asc" } },
          author: { select: { fullName: true, avatarUrl: true } }
        }
      }
    }
  });

  if (!roadmap || roadmap.status !== "PUBLISHED" || roadmap.steps.length === 0) {
    notFound();
  }

  // Pass only the specific step alongside the roadmap metadata
  return <StepViewer roadmap={JSON.parse(JSON.stringify(roadmap))} step={JSON.parse(JSON.stringify(roadmap.steps[0]))} />;
}

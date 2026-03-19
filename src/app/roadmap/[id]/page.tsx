import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RoadmapViewer } from "@/components/roadmap-viewer";

export const dynamic = "force-dynamic";

export default async function RoadmapDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const roadmap = await prisma.roadmap.findUnique({
    where: { id },
    include: {
      steps: {
        orderBy: { order: "asc" },
        include: {
          topics: { orderBy: { order: "asc" } },
          resources: { orderBy: { order: "asc" } },
        }
      }
    }
  });

  if (!roadmap || roadmap.status !== "PUBLISHED") {
    notFound();
  }

  return <RoadmapViewer roadmap={JSON.parse(JSON.stringify(roadmap))} />;
}

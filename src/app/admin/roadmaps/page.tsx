import { prisma } from "@/lib/prisma";
import AdminRoadmapsList from "./roadmaps-list";

export const dynamic = "force-dynamic";

export default async function AdminRoadmapsPage() {
  const roadmaps = await prisma.roadmap.findMany({
    orderBy: { order: "asc" },
    include: {
      steps: {
        select: {
          id: true,
          title: true,
          _count: { select: { topics: true, resources: true } }
        }
      }
    }
  });

  return <AdminRoadmapsList roadmaps={roadmaps} />;
}

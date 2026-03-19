import { prisma } from "@/lib/prisma";
import RecycleBinList from "./recycle-bin-list";

export const dynamic = "force-dynamic";

export default async function RecycleBinPage() {
  const deletedModules = await prisma.roadmapStep.findMany({
    where: { status: "DELETED" },
    include: { roadmap: { select: { title: true } } }
  });

  const deletedResources = await prisma.resource.findMany({
    where: { status: "DELETED" }
  });

  return (
    <div className="p-6">
      <RecycleBinList initialModules={deletedModules} initialResources={deletedResources} />
    </div>
  );
}

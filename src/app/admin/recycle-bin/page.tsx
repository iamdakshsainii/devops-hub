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

  const deletedEvents = await prisma.event.findMany({
    where: { status: "DELETED" }
  });

  const deletedRoadmaps = await prisma.roadmap.findMany({
    where: { status: "DELETED" }
  });

  const deletedCheatsheets = await prisma.cheatsheet.findMany({
    where: { status: "DELETED" },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, category: true, updatedAt: true }
  });

  const deletedBlogPosts = await prisma.blogPost.findMany({
    where: { status: "DELETED" },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, category: true, updatedAt: true }
  });

  const deletedTools: any[] = [];

  return (
    <div className="p-6">
      <RecycleBinList 
        initialModules={deletedModules} 
        initialResources={deletedResources} 
        initialEvents={deletedEvents}
        initialRoadmaps={deletedRoadmaps}
        initialCheatsheets={deletedCheatsheets}
        initialBlogPosts={deletedBlogPosts}
        // initialTools removed - decommissioned
      />
    </div>
  );
}

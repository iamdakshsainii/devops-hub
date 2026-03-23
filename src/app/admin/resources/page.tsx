import { prisma } from "@/lib/prisma";
import AdminResourcesList from "./resources-list";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  // ── Single source of truth: Resource table only ───────────────────────────
  // RoadmapResource rows are mirrored into Resource on every module save.
  // We no longer need to merge two tables here — just query Resource directly.

  const [globalResources, notes] = await Promise.all([
    prisma.resource.findMany({
      where: { status: { not: "DELETED" } },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { fullName: true } } },
    }),
    prisma.note.findMany({
      where: { status: { not: "DELETED" } },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { fullName: true } } },
    }),
  ]);

  // Find the stepId for module-linked resources so the "Edit in Module" button works.
  // We do this in one query — get all RoadmapResources that have a globalResourceId.
  const linkedResources = await prisma.roadmapResource.findMany({
    where: { globalResourceId: { not: null } },
    select: { globalResourceId: true, stepId: true },
  });
  const globalIdToStepId = new Map<string, string>();
  for (const r of linkedResources) {
    if (r.globalResourceId) globalIdToStepId.set(r.globalResourceId, r.stepId);
  }

  const resources = [
    // Global resources — attach stepId if they were created from a module
    ...globalResources.map((r) => ({
      ...r,
      isNote: false,
      isRoadmapResource: globalIdToStepId.has(r.id),
      stepId: globalIdToStepId.get(r.id) ?? null,

    })),

    // Notes — normalised to same shape
    ...notes.map((n: any) => ({
      id: n.id,
      title: n.title,
      type: "NOTES",
      url: `/notes/${n.id}`,
      description: n.content
        ? n.content.replace(/<[^>]*>?/gm, "").substring(0, 120) + "..."
        : "Document Note",
      imageUrl: n.coverImage || null,
      tags: n.tags || "Notes",
      status: n.status,
      createdAt: n.createdAt,
      author: n.author,
      isNote: true,
      isRoadmapResource: false,
      stepId: null,
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const activeCount = resources.filter((r) => r.status !== "DELETED").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Resources Manager ({activeCount})
        </h1>
        <p className="text-muted-foreground mt-1">
          All resources — standalone, module-linked, and notes — in one place.
        </p>
      </div>
      <AdminResourcesList resources={resources} />
    </div>
  );
}

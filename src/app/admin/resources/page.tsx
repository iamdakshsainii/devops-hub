import { prisma } from "@/lib/prisma";
import AdminResourcesList from "./resources-list";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {

  const [globalResources, roadmapResources, notes] = await Promise.all([
    prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { fullName: true } } }
    }),
    prisma.roadmapResource.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        step: {
          select: {
            id: true,
            title: true,
            roadmap: { select: { title: true } }
          }
        }
      }
    }),
    prisma.note.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { fullName: true } } }
    })
  ]);

  // Build a set of URLs already covered by globalResources so we don't
  // double-show module resources that were mirrored into the Resource table.
  const globalUrlSet = new Set(
    globalResources.map((r) => r.url?.trim().toLowerCase()).filter(Boolean)
  );

  // Only include RoadmapResources that do NOT have a mirror in the global table.
  // Resources that were properly synced by the module editor will already appear
  // via globalResources — so we only surface orphans here (legacy data or
  // resources added before the sync was in place).
  const unmirroredRoadmapResources = roadmapResources.filter((r) => {
    const key = r.url?.trim().toLowerCase();
    return key && !globalUrlSet.has(key);
  });

  const mergedResources = [
    // Global resources (includes module-mirrored ones tagged "Module")
    ...globalResources.map((r) => ({
      ...r,
      isRoadmapResource: r.tags === "Module",
      isNote: false,
      // For module-tagged resources, try to find the matching step for edit link
      stepId: null as string | null,
    })),

    // Notes
    ...notes.map((n: any) => ({
      ...n,
      type: "NOTES",
      url: `/notes/${n.id}`,
      description: n.content
        ? n.content.replace(/<[^>]*>?/gm, "").substring(0, 120) + "..."
        : "Document Note",
      imageUrl: n.coverImage || null,
      status: n.status || "PUBLISHED",
      isNote: true,
      isRoadmapResource: false,
      stepId: null as string | null,
    })),

    // Unmirrored RoadmapResources (legacy / pre-sync data)
    ...unmirroredRoadmapResources.map((r: any) => ({
      ...r,
      // Safe optional chaining — orphaned resources have no step
      author: { fullName: r.step?.roadmap?.title || "Module" },
      description: r.description
        ? `${r.description}${r.step?.title ? ` · ${r.step.title}` : ""}`
        : `From module: ${r.step?.title || "Unknown Module"}`,
      status: "PUBLISHED",
      isRoadmapResource: true,
      isNote: false,
      stepId: r.step?.id || null,
      tags: r.tags || "",
      _count: { upvotes: 0 },
    })),
  ];

  // Deduplicate by URL (prefer global rows over roadmap rows)
  const uniqueMap = new Map<string, any>();
  for (const res of mergedResources) {
    const key = res.url && res.url !== "#"
      ? res.url.trim().toLowerCase()
      : res.id;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, res);
    }
  }

  const resources = Array.from(uniqueMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Patch stepId onto global "Module" resources so the Edit button links correctly
  // Match by URL against roadmapResources
  const urlToStepId = new Map<string, string>();
  for (const r of roadmapResources) {
    if (r.url && r.step?.id) {
      urlToStepId.set(r.url.trim().toLowerCase(), r.step.id);
    }
  }
  for (const res of resources) {
    if (res.isRoadmapResource && !res.stepId && res.url) {
      res.stepId = urlToStepId.get(res.url.trim().toLowerCase()) || null;
    }
  }

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
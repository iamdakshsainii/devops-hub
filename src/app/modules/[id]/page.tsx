import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StepViewer } from "@/components/step-viewer";

export const dynamic = "force-dynamic";

export default async function ModuleDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ roadmapId?: string }>;
}) {
    const { id } = await params;
    const { roadmapId } = await searchParams;

    const step = await prisma.roadmapStep.findUnique({
        where: { id },
        include: {
            topics: {
                orderBy: { order: "asc" },
                include: { subtopics: { orderBy: { order: "asc" } } },
            },
            resources: { orderBy: { order: "asc" } },
            author: { select: { fullName: true, avatarUrl: true } },
        },
    });

    if (!step || step.status !== "PUBLISHED") notFound();

    // Fetch dynamic resources matching tags for recommendations
    const tagList = step.tags ? step.tags.split(",").map((t: string) => t.trim()) : [];
    const dynamicResources = tagList.length > 0 ? await prisma.resource.findMany({
        where: {
            tags: { contains: tagList[0], mode: "insensitive" },
            status: "PUBLISHED"
        },
        take: 4,
        include: { author: { select: { fullName: true } } }
    }) : [];

    let roadmap = null;
    let roadmapSteps: { id: string; title: string; icon: string; order: number }[] = [];

    if (roadmapId) {
        roadmap = await prisma.roadmap.findUnique({
            where: { id: roadmapId },
            include: {
                steps: {
                    where: { status: "PUBLISHED" },
                    orderBy: { order: "asc" },
                    select: { id: true, title: true, icon: true, order: true },
                },
            },
        });
        if (roadmap) roadmapSteps = roadmap.steps;
    }

    const roadmapContext = roadmap ?? {
        id: "",
        title: "All Modules",
        description: "",
        icon: "📦",
        color: "#6366f1",
    };

    return (
        <StepViewer
            roadmap={JSON.parse(JSON.stringify(roadmapContext))}
            step={JSON.parse(JSON.stringify(step))}
            roadmapSteps={JSON.parse(JSON.stringify(roadmapSteps))}
            isStandalone={!roadmapId || !roadmap}
            dynamicResources={JSON.parse(JSON.stringify(dynamicResources))}
        />
    );
}
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronLeft, Map } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RoadmapDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const [roadmap, progress] = await Promise.all([
    prisma.roadmap.findUnique({
    where: { id },
    include: {
      steps: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
        include: {
          topics: { select: { title: true, id: true, content: true, subtopics: { select: { id: true, content: true } } } },
          _count: { select: { topics: true, resources: true } }
        }
      }
    }
  }),
    session?.user?.id ? prisma.userProgress.findMany({ where: { userId: session.user.id } }) : []
  ]);
  const completedItemIds = new Set(progress.map((p: any) => p.itemId));

  if (!roadmap || roadmap.status !== "PUBLISHED") notFound();

  const totalTopics = roadmap.steps.reduce((acc, step) => acc + step._count.topics, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="container px-4 py-4 max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/roadmap" className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div
            className="text-3xl h-12 w-12 rounded-xl flex items-center justify-center border shadow-sm shrink-0"
            style={{ backgroundColor: `${roadmap.color}15` }}
          >
            {roadmap.icon}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{roadmap.title}</h1>
            <p className="text-sm text-muted-foreground line-clamp-1">{roadmap.description}</p>
          </div>
        </div>
      </div>

      <div className="container px-4 py-12 max-w-5xl mx-auto">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="inline-flex items-center rounded-full border bg-muted/30 px-3 py-1 text-xs text-foreground/80 shadow-sm backdrop-blur-md mb-4 uppercase tracking-widest font-bold font-mono">
            <Map className="h-3.5 w-3.5 mr-2" style={{ color: roadmap.color }} />
            {roadmap.steps.length} Steps · {totalTopics} Topics
          </div>
          <h2 className="text-3xl font-extrabold mb-4">Select a learning module</h2>
          <p className="text-muted-foreground max-w-2xl text-lg">
            This roadmap is broken down into structured steps. Click on any step to open its detailed guide, topics, and resources.
          </p>
        </div>

        <div className="space-y-6 relative">
          {/* Vertical connecting line */}
          <div
            className="absolute top-8 bottom-8 left-8 w-1 rounded-full hidden sm:block bg-gradient-to-b"
            style={{ backgroundImage: `linear-gradient(to bottom, ${roadmap.color}, ${roadmap.color}20)` }}
          />

          {roadmap.steps.map((step, i) => {
            let trackingTotal = 0;
            let trackingCompleted = 0;
            for (const t of step.topics) {
              trackingTotal += 1;
              if (completedItemIds.has(t.id)) trackingCompleted += 1;
            }
            const isCompleted = trackingTotal > 0 && trackingCompleted === trackingTotal;
            return (
            // Each step links to /modules/[stepId]?roadmapId=[roadmapId]
            // This passes roadmap context so the module page shows roadmap nav
            <Link
              key={step.id}
              href={`/modules/${step.id}?roadmapId=${roadmap.id}`}
              className="block relative z-10 group"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-8">
                {/* Station Node */}
                <div className="flex items-center gap-4 shrink-0 sm:w-16">
                  <div
                    className={`hidden sm:flex w-16 h-16 rounded-2xl bg-card border shadow-sm items-center justify-center relative z-20 group-hover:scale-110 transition-transform duration-300 ${isCompleted ? "shadow-[0_0_20px_rgba(16,185,129,0.7)] border-emerald-500 scale-105" : ""}`}
                    style={{ borderColor: isCompleted ? '#10b981' : `${roadmap.color}50` }}
                  >
                    <span className="text-xl font-black" style={{ color: isCompleted ? '#10b981' : roadmap.color }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div
                    className="sm:hidden w-10 h-10 rounded-xl bg-card border flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ borderColor: isCompleted ? '#10b981' : `${roadmap.color}50`, color: isCompleted ? '#10b981' : roadmap.color }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>

                {/* Card */}
                <div className="flex-1 bg-card border rounded-2xl p-6 hover:shadow-xl hover:border-foreground/30 transition-all duration-300 relative overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 w-1.5 h-full transition-opacity ${isCompleted ? "opacity-100 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "opacity-0 group-hover:opacity-100"}`}
                    style={{ backgroundColor: isCompleted ? undefined : roadmap.color }}
                  />

                  <div className="sm:flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{step.icon}</span>
                        <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed line-clamp-2 md:line-clamp-none max-w-2xl">
                        {step.description}
                      </p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-muted-foreground/30 sm:mt-2 group-hover:text-primary group-hover:translate-x-1 sm:group-hover:translate-x-2 transition-all shrink-0 hidden sm:block" />
                  </div>

                  {(step as any).topics && (step as any).topics.length > 0 && (
                     <div className="flex flex-wrap gap-1.5 mt-4">
                        {(step as any).topics.map((t: any) => (
                           <div 
                              key={t.id} 
                              className="text-[11px] bg-muted/50 text-foreground/80 px-2 py-0.5 rounded border border-border/30 font-medium"
                           >
                              {t.title}
                           </div>
                        ))}
                        {step._count.topics > 3 && (
                           <div className="text-[11px] text-muted-foreground/60 px-1 py-0.5">
                              +{step._count.topics - 3} more...
                           </div>
                        )}
                     </div>
                  )}

                  <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/50 text-xs sm:text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-md">
                      <BookOpen className="h-4 w-4" style={{ color: roadmap.color }} />
                      <span>{step._count.topics} Topics</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-md">
                      <span className="text-base leading-none" style={{ color: roadmap.color }}>📎</span>
                      <span>{step._count.resources} Resources</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
          })}
        </div>
      </div>
    </div>
  );
}
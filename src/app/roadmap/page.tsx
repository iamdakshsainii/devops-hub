import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Map } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const roadmaps = await prisma.roadmap.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
    include: {
      steps: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          icon: true,
          order: true,
          _count: { select: { topics: true, resources: true } }
        }
      }
    }
  });

  const totalSteps = roadmaps.reduce((sum, r) => sum + r.steps.length, 0);
  const totalTopics = roadmaps.reduce((sum, r) => sum + r.steps.reduce((s, st) => s + st._count.topics, 0), 0);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background z-0" />
        <div className="container relative z-10 px-4 mx-auto text-center space-y-6 max-w-3xl">
          <div className="inline-flex items-center rounded-full border bg-muted/30 px-3 py-1 text-sm text-foreground/80 shadow-sm backdrop-blur-md">
            <Map className="h-4 w-4 mr-2 text-primary" />
            {roadmaps.length} Roadmaps · {totalSteps} Steps · {totalTopics} Topics
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50">Roadmaps</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Structured, step-by-step guides curated by the community. Pick a path and start mastering it today.
          </p>
        </div>
      </section>

      {/* Metro Line Cards */}
      <section className="container px-4 mx-auto max-w-5xl pb-24 -mt-4">
        {roadmaps.length > 0 ? (
          <div className="space-y-10">
            {roadmaps.map((roadmap) => (
              <Link key={roadmap.id} href={`/roadmap/${roadmap.id}`} className="block group">
                <div className="relative bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:border-foreground/20 transition-all duration-500">
                  {/* Colored top accent */}
                  <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${roadmap.color}, ${roadmap.color}80)` }} />
                  
                  <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl h-14 w-14 rounded-2xl flex items-center justify-center border shadow-sm" style={{ backgroundColor: `${roadmap.color}15` }}>
                          {roadmap.icon}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">{roadmap.title}</h2>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{roadmap.description}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="hidden sm:flex rounded-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                        Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>

                    {/* Metro Line */}
                    <div className="relative">
                      {/* The line */}
                      <div className="absolute top-5 left-5 right-5 h-0.5 rounded-full" style={{ backgroundColor: `${roadmap.color}40` }} />
                      <div
                        className="absolute top-5 left-5 h-0.5 rounded-full transition-all duration-1000 group-hover:shadow-lg"
                        style={{
                          backgroundColor: roadmap.color,
                          width: `calc(100% - 2.5rem)`,
                          boxShadow: `0 0 12px ${roadmap.color}60`,
                        }}
                      />

                      {/* Stations */}
                      <div className="relative flex justify-between px-0">
                        {roadmap.steps.map((step, i) => (
                          <div key={step.id} className="flex flex-col items-center text-center" style={{ width: `${100 / Math.max(roadmap.steps.length, 1)}%` }}>
                            {/* Station dot */}
                            <div
                              className="relative w-10 h-10 rounded-full border-[3px] border-background shadow-md flex items-center justify-center text-sm z-10 transition-transform duration-300 group-hover:scale-110"
                              style={{ backgroundColor: roadmap.color }}
                            >
                              <span className="text-white font-bold text-xs">{String(i + 1).padStart(2, "0")}</span>
                            </div>
                            {/* Label */}
                            <div className="mt-3 max-w-[100px]">
                              <p className="text-xs font-semibold leading-tight line-clamp-2">{step.title}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{step._count.topics} topics</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer stats */}
                    <div className="flex items-center gap-6 mt-8 pt-4 border-t text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {roadmap.steps.length} Steps</span>
                      <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {roadmap.steps.reduce((s, st) => s + st._count.topics, 0)} Topics</span>
                      <span className="flex items-center gap-1">📚 {roadmap.steps.reduce((s, st) => s + st._count.resources, 0)} Resources</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center border rounded-3xl bg-muted/10 border-dashed">
            <Map className="h-12 w-12 text-muted-foreground/30 mb-6" />
            <h2 className="text-2xl font-bold mb-2">No roadmaps yet</h2>
            <p className="text-muted-foreground max-w-md">An admin needs to create the first roadmap. Check back soon!</p>
          </div>
        )}
      </section>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Map, Search, LayoutGrid, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; steps?: string }>;
}) {
  const { q = "", sort = "newest", steps = "all" } = await searchParams;

  const where: any = { status: "PUBLISHED" };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  let roadmaps = await prisma.roadmap.findMany({
    where,
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
          _count: { select: { topics: true, resources: true } },
        },
      },
    },
  });

  // Calculate stats
  const totalRoadmaps = roadmaps.length;
  const totalSteps = roadmaps.reduce((sum, r) => sum + r.steps.length, 0);
  const totalTopics = roadmaps.reduce((sum, r) => sum + r.steps.reduce((s, st) => s + st._count.topics, 0), 0);

  // Apply steps filter
  if (steps !== "all") {
    roadmaps = roadmaps.filter((r) => {
      const cnt = r.steps.length;
      if (steps === "short") return cnt <= 4;
      if (steps === "medium") return cnt > 4 && cnt <= 8;
      if (steps === "long") return cnt > 8;
      return true;
    });
  }

  // Apply sorting
  if (sort === "steps") {
    roadmaps.sort((a, b) => b.steps.length - a.steps.length);
  } else if (sort === "topics") {
    roadmaps.sort(
      (a, b) =>
        b.steps.reduce((s, st) => s + st._count.topics, 0) -
        a.steps.reduce((s, st) => s + st._count.topics, 0)
    );
  }

  const SORTS = [
    { label: "Default", value: "newest" },
    { label: "By Steps", value: "steps" },
    { label: "By Topics", value: "topics" },
  ];

  const STEP_BUCKETS = [
    { label: "All Lengths", value: "all" },
    { label: "Short (≤ 4 steps)", value: "short" },
    { label: "Medium (5-8 steps)", value: "medium" },
    { label: "Long (> 8 steps)", value: "long" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative py-12 lg:py-16 overflow-hidden border-b bg-muted/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent z-0" />
        <div className="container relative z-10 px-4 mx-auto space-y-4 max-w-7xl">
          <div className="inline-flex items-center rounded-full border bg-background/50 px-3 py-1 text-xs text-foreground/80 shadow-sm backdrop-blur-md">
            <Map className="h-3.5 w-3.5 mr-1.5 text-primary" />
            {totalRoadmaps} Guides · {totalSteps} Steps · {totalTopics} Topics
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">Roadmaps</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl">
            Structured, step-by-step guides curated by the community to master DevOps infrastructure step by step.
          </p>
        </div>
      </section>

      {/* Main Grid Layout */}
      <section className="container px-4 mx-auto max-w-7xl py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Area */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-5">
            <form method="GET" action="/roadmap" className="space-y-5">
              <Card className="shadow-smooth border-slate-100 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Search className="h-4 w-4 text-primary" /> Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    name="q"
                    placeholder="Search paths..."
                    defaultValue={q}
                    className="h-9 text-sm"
                  />
                  {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
                  {steps !== "all" && <input type="hidden" name="steps" value={steps} />}
                </CardContent>
              </Card>

              {/* Sorting Bucket */}
              <Card className="shadow-smooth border-slate-100 dark:border-slate-800">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-purple-500" /> Sort By
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 flex flex-col gap-1">
                  {SORTS.map((s) => (
                    <Link
                      key={s.value}
                      href={`/roadmap?sort=${s.value}${q ? `&q=${encodeURIComponent(q)}` : ""}${steps !== "all" ? `&steps=${steps}` : ""}`}
                      className={`text-xs px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        sort === s.value
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Steps Bucket */}
              <Card className="shadow-smooth border-slate-100 dark:border-slate-800">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <LayoutGrid className="h-4 w-4 text-blue-500" /> Path Length
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 flex flex-col gap-1">
                  {STEP_BUCKETS.map((s) => (
                    <Link
                      key={s.value}
                      href={`/roadmap?steps=${s.value}${q ? `&q=${encodeURIComponent(q)}` : ""}${sort !== "newest" ? `&sort=${sort}` : ""}`}
                      className={`text-xs px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        steps === s.value
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </form>
          </aside>

          {/* Grid Content Area */}
          <div className="flex-1">
            {roadmaps.length > 0 ? (
              <div className="space-y-8">
                {roadmaps.map((roadmap) => (
                  <Link key={roadmap.id} href={`/roadmap/${roadmap.id}`} className="block group">
                    <div className="relative bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                      {/* Accent Strip */}
                      <div className="h-1 w-full" style={{ backgroundColor: roadmap.color }} />

                      <div className="p-6 md:p-8">
                        <div className="flex items-start justify-between gap-4 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl h-12 w-12 rounded-xl flex items-center justify-center border shadow-sm" style={{ backgroundColor: `${roadmap.color}15` }}>
                              {roadmap.icon}
                            </div>
                            <div>
                              <h2 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                                {roadmap.title}
                              </h2>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {roadmap.description}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="rounded-full gap-1.5 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>

                        {/* Station dots linear representation */}
                        <div className="relative pt-2">
                          <div className="absolute top-4 left-4 right-4 h-0.5 rounded-full" style={{ backgroundColor: `${roadmap.color}30` }} />
                          <div className="relative flex justify-between">
                            {roadmap.steps.map((step, i) => (
                              <div key={step.id} className="flex flex-col items-center" style={{ width: `${100 / Math.max(roadmap.steps.length, 1)}%` }}>
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold z-10 text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                                  style={{ backgroundColor: roadmap.color }}
                                >
                                  {String(i + 1).padStart(2, "0")}
                                </div>
                                <span className="text-[10px] font-medium mt-1.5 text-center line-clamp-1 max-w-[80px]">
                                  {step.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer Stat Row */}
                        <div className="flex items-center gap-5 mt-6 pt-4 border-t text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5 text-blue-500" /> {roadmap.steps.length} Steps</span>
                          <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-purple-500" /> {roadmap.steps.reduce((s, st) => s + st._count.topics, 0)} Topics</span>
                          <span className="flex items-center gap-1">📚 {roadmap.steps.reduce((s, st) => s + st._count.resources, 0)} Resources</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl bg-muted/20 border-dashed">
                <Map className="h-10 w-10 text-muted-foreground/40 mb-4" />
                <h2 className="text-xl font-bold mb-1">No matching paths</h2>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your search criteria in the left sidebar.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

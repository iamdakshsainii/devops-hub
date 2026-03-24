import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Map, Search, LayoutGrid, Clock, Calendar, Edit } from "lucide-react";
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
  const session = await getServerSession(authOptions);
  const isAdmin = !!(session?.user && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role));

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
        {/* Core selection portal layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <Link href="/roadmap?q=DevOps" className="group">
              <div className="p-7 h-full backdrop-blur-xl bg-card/60 border border-border/10 rounded-2xl hover:border-primary/30 shadow-md hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] transition-all duration-500 relative overflow-hidden flex flex-col items-start group hover:-translate-y-1">
                 <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-500 blur-2xl pointer-events-none bg-primary" />
                 <div className="text-4xl mb-4 group-hover:scale-110 transition-all duration-500 filter drop-shadow-md">🚀</div>
                 <h3 className="text-lg font-extrabold tracking-tight group-hover:text-primary transition-colors">Core DevOps</h3>
                 <p className="text-xs text-muted-foreground mt-1.5 flex-1 leading-relaxed">Master core infrastructure components, CI/CD, and pipelined automation.</p>
                 <div className="mt-5 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-primary group-hover:underline">
                    Explore Focus <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
           </Link>

           <Link href="/roadmap?q=Security" className="group">
              <div className="p-7 h-full backdrop-blur-xl bg-card/60 border border-border/10 rounded-2xl hover:border-amber-500/30 shadow-md hover:shadow-[0_20px_40px_rgba(245,158,11,0.08)] transition-all duration-500 relative overflow-hidden flex flex-col items-start group hover:-translate-y-1">
                 <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-500 blur-2xl pointer-events-none bg-amber-500" />
                 <div className="text-4xl mb-4 group-hover:scale-110 transition-all duration-500 filter drop-shadow-md">🛡️</div>
                 <h3 className="text-lg font-extrabold tracking-tight group-hover:text-amber-500 transition-colors">DevSecOps</h3>
                 <p className="text-xs text-muted-foreground mt-1.5 flex-1 leading-relaxed">Implement security scanning, compliance grids, and shift-left configurations.</p>
                 <div className="mt-5 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-500 group-hover:underline">
                    Explore Focus <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
           </Link>

           <Link href="/roadmap?q=AI" className="group">
              <div className="p-7 h-full backdrop-blur-xl bg-card/60 border border-border/10 rounded-2xl hover:border-purple-500/30 shadow-md hover:shadow-[0_20px_40px_rgba(168,85,247,0.08)] transition-all duration-500 relative overflow-hidden flex flex-col items-start group hover:-translate-y-1">
                 <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-500 blur-2xl pointer-events-none bg-purple-500" />
                 <div className="text-4xl mb-4 group-hover:scale-110 transition-all duration-500 filter drop-shadow-md">🧠</div>
                 <h3 className="text-lg font-extrabold tracking-tight group-hover:text-purple-500 transition-colors">AIOps / MLOps</h3>
                 <p className="text-xs text-muted-foreground mt-1.5 flex-1 leading-relaxed">Monitor models, LLM Deployments, and setup metric anomaly detection streams.</p>
                 <div className="mt-5 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-purple-500 group-hover:underline">
                    Explore Focus <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
           </Link>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Area */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-5">
            <form method="GET" action="/roadmap" className="space-y-5">
              <Card className="backdrop-blur-md bg-card/60 shadow-md border-border/10 rounded-2xl">
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
              <Card className="backdrop-blur-md bg-card/60 shadow-md border-border/10 rounded-2xl">
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
              <Card className="backdrop-blur-md bg-card/60 shadow-md border-border/10 rounded-2xl">
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
                  <div key={roadmap.id} className="block group">
                    <div className="relative backdrop-blur-xl bg-card/60 border border-border/10 rounded-2xl overflow-hidden shadow-md hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)] hover:border-primary/30 transition-all duration-500 hover:-translate-y-1">
                      {/* Backlight sphere animation triggerswards coords item coords option downwards. */}
                      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-0 group-hover:opacity-10 transition-all duration-700 blur-3xl pointer-events-none" style={{ backgroundColor: roadmap.color }} />
                      
                      {/* Accent Strip */}
                      <div className="h-1 w-full" style={{ backgroundColor: roadmap.color, opacity: 0.8 }} />

                      <div className="p-6 md:p-8">
                        <div className="flex items-start justify-between gap-4 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl h-12 w-12 rounded-xl flex items-center justify-center border shadow-sm" style={{ backgroundColor: `${roadmap.color}15` }}>
                              {roadmap.icon}
                            </div>
                            <div>
                              <h2 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                                <Link href={`/roadmap/${roadmap.id}`} className="hover:underline">
                                  {roadmap.title}
                                </Link>
                              </h2>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {roadmap.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isAdmin && (
                              <Link href={`/admin/roadmaps?search=${encodeURIComponent(roadmap.title)}`} target="_blank">
                                 <Button variant="outline" size="sm" className="rounded-full h-8 text-xs font-bold gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border-amber-500/20 shadow-sm">
                                   <Edit className="h-3.5 w-3.5" /> Edit
                                 </Button>
                              </Link>
                            )}
                            <Link href={`/roadmap/${roadmap.id}`}>
                              <Button variant="ghost" size="sm" className="rounded-full gap-1.5 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Station dots linear representation */}
                        {/* Station dots linear representation */}
                        {roadmap.steps.length > 0 && (
                          <div className="relative pt-4 pb-2">
                            {/* Glowing connecting ribbon */}
                            <div 
                              className="absolute top-8 left-6 right-6 h-1 rounded-full bg-gradient-to-r" 
                              style={{ backgroundImage: `linear-gradient(to right, ${roadmap.color}, ${roadmap.color}40)` }} 
                            />
                            <div className="relative flex justify-between">
                              {roadmap.steps.map((step, i) => (
                                <div key={step.id} className="flex flex-col items-center relative z-10" style={{ width: `${100 / Math.max(roadmap.steps.length, 1)}%` }}>
                                  {/* Dot node with back glow */}
                                  <div className="relative group/dot flex items-center justify-center">
                                    <div className="absolute inset-0 rounded-full scale-125 blur-sm opacity-60 group-hover/dot:scale-150 transition-all duration-300" style={{ backgroundColor: `${roadmap.color}40` }} />
                                    <div
                                      className="w-10 h-10 rounded-full border-2 border-background flex items-center justify-center text-xs font-black text-white shadow-md relative group-hover/dot:scale-110 transition-transform duration-300"
                                      style={{ backgroundColor: roadmap.color }}
                                    >
                                      {String(i + 1).padStart(2, "0")}
                                    </div>
                                  </div>
                                  <span className="text-[11px] font-semibold mt-2.5 text-center line-clamp-1 max-w-[90px] text-foreground/80 group-hover:text-primary transition-colors">
                                    {step.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Footer Stat Row */}
                        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-muted-foreground">
                          <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/20">
                            <BookOpen className="h-3.5 w-3.5" style={{ color: roadmap.color }} /> 
                            <span>{roadmap.steps.length} Steps</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/20">
                            <FileText className="h-3.5 w-3.5" style={{ color: `${roadmap.color}bb` }} /> 
                            <span>{roadmap.steps.reduce((s, st) => s + st._count.topics, 0)} Topics</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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

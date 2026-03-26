import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronLeft, Library, Map, Edit, Trophy, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";

export const dynamic = "force-dynamic";

export default async function RoadmapDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
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
            attachedModules: {
              include: {
                module: {
                  include: {
                    topics: { select: { id: true } }
                  }
                }
              }
            },
            topics: { select: { id: true } },
            resources: { select: { id: true } },
            _count: { select: { topics: true, resources: true } }
          }
        }
      }
    }),
    session?.user?.id ? prisma.userProgress.findMany({ where: { userId: session.user.id } }) : []
  ]);

  const completedItemIds = new Set(progress.map((p: any) => p.itemId));
  const isAdmin = !!(session?.user && ["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role));

  if (!roadmap || roadmap.status !== "PUBLISHED") notFound();

  // 1. Calculate global stats with mutual exclusivity (Track Steps Checked)
  const stepsCompleted = (roadmap.steps || []).reduce((acc: number, step: any) => {
    const isProject = step.title.toLowerCase().includes("project") || step.title.toLowerCase().includes("capstone");
    const hasModules = (step as any).attachedModules?.length > 0;
    
    let isCompleted = false;

    if (isProject) {
       // PROJECT LOGIC: One trigger completion
       isCompleted = (step as any).resources?.some((r: any) => completedItemIds.has(r.id)) || false;
    } else if (hasModules) {
       // CURRICULUM LOGIC: All mandatory modules complete
       let trackingTotal = 0;
       let trackingCompleted = 0;
       (step as any).attachedModules.forEach((am: any) => {
         if (!am.isOptional) {
           trackingTotal += am.module.topics?.length || 0;
           trackingCompleted += (am.module.topics || []).filter((t: any) => completedItemIds.has(t.id)).length;
         }
       });
       if (trackingTotal > 0 && trackingCompleted === trackingTotal) isCompleted = true;
    } else if ((step as any).topics?.length > 0) {
       // TOPIC FALLBACK (Legacy or custom steps)
       const trackingTotal = (step as any).topics.length;
       const trackingCompleted = (step as any).topics.filter((t: any) => completedItemIds.has(t.id)).length;
       isCompleted = trackingTotal > 0 && trackingCompleted === trackingTotal;
    }
    
    return acc + (isCompleted ? 1 : 0);
  }, 0);

  const globalPercentage = roadmap.steps.length > 0 ? Math.round((stepsCompleted / roadmap.steps.length) * 100) : 0;

  const getMotivation = (p: number) => {
    if (p === 0) return "Just getting started";
    if (p < 30) return "Solid start, keep going!";
    if (p < 70) return "Making great progress!";
    if (p < 100) return "Almost there, finish strong!";
    return "Roadmap mastered! 🎉";
  };

  const getIcon = (icon: string) => {
    return icon || "📍";
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* ── PREMIUM COMPACT HERO SECTION ── */}
      <div className="relative border-b bg-transparent overflow-hidden pt-1.5 pb-5 lg:pt-2 lg:pb-7">
        <div 
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 -z-10 m-auto h-[250px] w-full max-w-4xl rounded-full blur-[100px] opacity-[0.12] dark:opacity-25" 
          style={{ backgroundImage: `radial-gradient(circle at center, ${roadmap.color}, transparent)` }}
        />

        <div className="container px-6 max-w-6xl mx-auto flex flex-col gap-3.5">
            {/* Minimalist Professional Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[11px] font-black uppercase tracking-tight text-muted-foreground/40 group/nav">
                <Link href="/roadmap" className="hover:text-foreground transition-all duration-300 flex items-center gap-2">
                  Roadmaps
                </Link>
                <span className="text-muted-foreground/30 font-light text-base mx-1">/</span>
                <span className="text-foreground/70 transition-colors group-hover/nav:text-foreground normal-case font-bold">{roadmap.title}</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12">
                <div className="flex-1 space-y-4 text-left">
                    <div className="flex items-center gap-4">
                       <div 
                        className="text-2xl h-11 w-11 rounded-xl flex items-center justify-center bg-background border border-border/30 shadow-md shrink-0" 
                        style={{ borderColor: `${roadmap.color}33`, boxShadow: `0 0 20px ${roadmap.color}10` }}
                       >
                         {roadmap.icon}
                       </div>
                       <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                         {roadmap.title}
                       </h1>
                    </div>
                    
                    <p className="text-muted-foreground text-xs md:text-sm max-w-2xl leading-relaxed font-bold opacity-60">
                        {roadmap.description}
                    </p>

                    <div className="flex items-center gap-3 pt-1">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-border/10 bg-muted/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-foreground/50">
                            <Map className="h-3 w-3 opacity-60" style={{ color: roadmap.color }} />
                            {roadmap.steps.length} Steps in Path
                        </div>
                    </div>
                </div>

                {/* ── ULTRA-PREMIUM MASTERY HUD ── */}
                <div className="shrink-0 flex items-center gap-6 p-4 md:p-5 rounded-3xl bg-background/50 dark:bg-zinc-900/40 border border-white/[0.1] shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-right-10 duration-1000 delay-300 hover:scale-[1.03] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] transition-all duration-500 ease-out-back cursor-default group/hud">
                    <div className="relative group/ring transition-transform duration-500 group-hover/hud:translate-x-1">
                        <ProgressRing
                          percent={globalPercentage}
                          color={globalPercentage === 100 ? "#10b981" : roadmap.color}
                          size={84}
                          stroke={7}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center -space-y-0.5">
                            <span className="text-xl font-black tabular-nums tracking-tighter tabular-nums bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/80">
                                {globalPercentage}
                            </span>
                            <span className="text-[9px] font-black uppercase text-foreground/40 tracking-tighter">%</span>
                        </div>

                         {/* Pulse Glow Effect for 100% */}
                         {globalPercentage === 100 && (
                            <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping-slow -z-10" />
                         )}
                    </div>

                    <div className="flex flex-col gap-2.5 min-w-[140px]">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                {globalPercentage === 100 ? <Trophy className="h-3 w-3 text-emerald-500 shrink-0" /> : <Flame className="h-3 w-3 text-orange-500 shrink-0" />}
                                <span className={`text-[10px] font-black uppercase tracking-[0.12em] whitespace-nowrap ${globalPercentage === 100 ? "text-emerald-500" : "text-foreground/70"}`}>
                                    {getMotivation(globalPercentage)}
                                </span>
                            </div>
                            <div className="text-xl font-black tracking-tighter text-foreground uppercase group-hover/hud:text-primary transition-colors duration-500">
                                {globalPercentage === 100 ? "Mastery" : "Pathing"}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2.5 border-t border-white/[0.08]">
                             <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 leading-none mb-1">Status</span>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${globalPercentage === 100 ? 'bg-emerald-500 animate-pulse' : 'bg-primary'}`} style={{ backgroundColor: globalPercentage === 100 ? undefined : roadmap.color }} />
                                    <span className="text-[11px] font-black text-foreground uppercase tracking-tight">Step {stepsCompleted}/{roadmap.steps.length}</span>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="container px-6 py-10 m-auto max-w-5xl">
          <div className="mb-10 text-center space-y-2 text-foreground">
              <h2 className="text-xl md:text-2xl font-black tracking-tight">
                 Your Learning Path
              </h2>
              <div className="h-0.5 w-8 bg-primary/20 rounded-full mx-auto" style={{ background: roadmap.color }} />
              <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest opacity-30 mt-2">
                Follow modules sequentially
              </p>
          </div>

        <div className="space-y-4 md:space-y-6 relative">
          {roadmap.steps.map((step: any, i: number) => {
            const isProject = step.title.toLowerCase().includes("project") || step.title.toLowerCase().includes("capstone");
            const hasModules = (step as any).attachedModules?.length > 0;

            let isCompleted = false;
            if (isProject) {
              isCompleted = (step as any).resources?.some((r: any) => completedItemIds.has(r.id)) || false;
            } else if (hasModules) {
              let trackingTotal = 0;
              let trackingCompleted = 0;
              (step as any).attachedModules.forEach((am: any) => {
                if (!am.isOptional) {
                   trackingTotal += am.module.topics?.length || 0;
                   trackingCompleted += (am.module.topics || []).filter((t: any) => completedItemIds.has(t.id)).length;
                }
              });
              if (trackingTotal > 0 && trackingCompleted === trackingTotal) isCompleted = true;
            } else if ((step as any).topics?.length > 0) {
              const trackingTotal = (step as any).topics.length;
              const trackingCompleted = (step as any).topics.filter((t: any) => completedItemIds.has(t.id)).length;
              isCompleted = trackingTotal > 0 && trackingCompleted === trackingTotal;
            }


            return (
            <div key={step.id} className="relative group/step">
               {isAdmin && (
                <a 
                   href={`/admin/modules?search=${encodeURIComponent(step.title)}`} 
                   target="_blank" 
                   rel="noreferrer"
                   className="absolute top-5 right-10 z-30 flex items-center gap-1.5 opacity-0 group-hover/step:opacity-100 transition-opacity"
                >
                  <Button variant="outline" size="sm" className="h-6 text-[9px] items-center font-black px-2 gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border-amber-500/20 shadow-sm rounded-md tracking-widest uppercase">
                    <Edit className="h-2.5 w-2.5" /> Edit
                  </Button>
                </a>
              )}
              <Link
                href={`/roadmap/${roadmap.id}/${step.id}`}
                className="block relative z-10"
              >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-8 relative">
                  {i < roadmap.steps.length - 1 && (
                     <div 
                        className={`absolute top-12 bottom-[-16px] left-6 w-1 hidden sm:block -z-10 transition-all duration-700 rounded-full`}
                        style={{ backgroundColor: isCompleted ? '#10b981' : `${roadmap.color}20` }}
                     />
                  )}
                  
                  {/* Station Node */}
                <div className="flex items-center gap-3 shrink-0 sm:w-12 relative z-20">
                  <div
                    className={`hidden sm:flex w-12 h-12 rounded-xl border items-center justify-center relative transition-all duration-500 bg-background/90 dark:bg-zinc-900/80 backdrop-blur-md group-hover:scale-105 shadow-sm`}
                    style={{ 
                        borderColor: isCompleted ? '#10b981' : `${roadmap.color}30`,
                        boxShadow: isCompleted ? `0 0 25px rgba(16,185,129,0.3)` : `0 5px 15px ${roadmap.color}15`
                    }}
                  >
                    <span className="text-sm font-black drop-shadow-sm" style={{ color: isCompleted ? '#10b981' : roadmap.color }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div
                    className={`sm:hidden w-8 h-8 rounded-lg border flex items-center justify-center font-black text-[10px] shrink-0 bg-background/95 dark:bg-zinc-950/90 shadow-sm`}
                    style={{ borderColor: isCompleted ? '#10b981' : `${roadmap.color}30`, color: isCompleted ? '#10b981' : roadmap.color }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>

                {/* Card */}
                <div className="flex-1 bg-background/50 dark:bg-zinc-900/30 backdrop-blur-3xl border border-border/30 dark:border-white/[0.03] rounded-2xl p-5 lg:p-6 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(59,130,246,0.06)] transition-all duration-700 relative overflow-hidden group ring-1 ring-white/10 dark:ring-white/[0.02] hover:-translate-y-0.5">
                  {/* ADVANCED ATMOSPHERIC OVERLAY (DARK MODE) */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-0 dark:opacity-0 dark:group-hover:opacity-10 transition-all duration-700 pointer-events-none" style={{ backgroundColor: roadmap.color }} />
                  
                  {/* Card Indicator Strip */}
                  <div
                    className={`absolute top-0 left-0 w-1 pt-1 h-full transition-all duration-500 ${isCompleted ? "opacity-100 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" : "opacity-0 group-hover:opacity-100"}`}
                    style={{ backgroundColor: isCompleted ? undefined : roadmap.color }}
                  />

                  <div className="sm:flex justify-between items-start gap-4 relative z-10">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-card shadow-sm border border-border/30 text-xl shrink-0">
                           {step.icon}
                        </div>
                        <h3 className="text-xl lg:text-2xl font-black tracking-tight group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-none max-w-2xl font-bold opacity-80">
                        {step.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground/30 sm:mt-2 group-hover:text-primary group-hover:translate-x-2 transition-transform duration-500 shrink-0 hidden sm:block" style={{ color: roadmap.color }} />
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/10 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-muted/30 px-2.5 py-1 rounded-md border border-border/10">
                       {step.attachedModules?.length > 0 ? (
                          <>
                             <Library className="h-3 w-3" style={{ color: roadmap.color }} />
                             <span>{step.attachedModules.length} Modules</span>
                          </>
                       ) : (
                          <>
                             <BookOpen className="h-3 w-3" style={{ color: roadmap.color }} />
                             <span>{step._count?.resources || 0} Project Resources</span>
                          </>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
            );
          })}
        </div>
      </div>
    </div>
  );
  } catch (error: any) {
    console.error("Roadmap Page error:", error);
    return <div>Something went wrong while loading this roadmap.</div>;
  }
}

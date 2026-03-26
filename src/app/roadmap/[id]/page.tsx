import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronLeft, Library, Map, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    const hasModules = (step as any).attachedModules?.length > 0;
    let trackingTotal = 0;
    let trackingCompleted = 0;

    if (hasModules) {
      (step as any).attachedModules.forEach((am: any) => {
        // ONLY count mandatory modules for Step Mastery
        if (!am.isOptional) {
          trackingTotal += am.module.topics?.length || 0;
          trackingCompleted += (am.module.topics || []).filter((t: any) => completedItemIds.has(t.id)).length;
        }
      });
    }
    
    // Check if step is done (If no mandatory modules, it defaults to completion if it has topics or just as 0/0)
    const isCompleted = trackingTotal > 0 && trackingCompleted === trackingTotal;
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
      <div className="relative border-b bg-card/[0.03] dark:bg-zinc-950/20 backdrop-blur-3xl overflow-hidden pt-6 pb-8 lg:pt-8 lg:pb-10">
        <div 
          className="absolute inset-x-0 -top-40 -z-10 m-auto h-[380px] w-full max-w-4xl rounded-full blur-[110px] opacity-20 dark:opacity-30" 
          style={{ backgroundImage: `radial-gradient(circle at center, ${roadmap.color}, transparent)` }}
        />

        <div className="container px-6 max-w-6xl mx-auto flex flex-col gap-6">
            {/* Elegant Visible Breadcrumb Nav (The only big text the user requested) */}
            <nav className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/50 group/nav">
                <Link href="/roadmap" className="hover:text-foreground transition-all duration-300 flex items-center gap-2 pr-1.5 border-r border-border/20">
                  Roadmaps
                </Link>
                <span className="text-foreground/70 lowercase transition-colors group-hover/nav:text-foreground">{roadmap.title}</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-12">
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

                {/* Integrated Compact Horizontal Progress */}
                <div className="shrink-0 w-full lg:w-72 space-y-2 lg:mb-1 animate-in fade-in slide-in-from-right-10 duration-1000 delay-300">
                    <div className="flex items-end justify-between px-1">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1.5 opacity-80">{getMotivation(globalPercentage)}</span>
                            <span className="text-[10px] font-black uppercase tracking-tight text-foreground/40 leading-none">Status</span>
                        </div>
                        <span className="text-2xl font-black tabular-nums text-foreground leading-none tracking-tighter">
                            {globalPercentage}<span className="text-[10px] ml-0.5 opacity-20 font-bold">%</span>
                        </span>
                    </div>
                    
                    <div className="relative h-2 w-full bg-muted/30 dark:bg-white/5 rounded-full overflow-hidden border border-border/10 p-0.5 shadow-inner">
                        <div 
                           className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                           style={{ width: `${globalPercentage}%` }} 
                        />
                    </div>
                    
                    <p className="text-[9px] text-muted-foreground font-black tracking-widest uppercase opacity-40 text-right pr-1">
                        {stepsCompleted} / {roadmap.steps.length} Steps
                    </p>
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
            const hasModules = (step as any).attachedModules?.length > 0;
            let trackingTotal = 0;
            let trackingCompleted = 0;

            if (hasModules) {
              (step as any).attachedModules.forEach((am: any) => {
                if (!am.isOptional) {
                   trackingTotal += am.module.topics?.length || 0;
                   trackingCompleted += (am.module.topics || []).filter((t: any) => completedItemIds.has(t.id)).length;
                }
              });
            } else {
              trackingTotal = 0;
              trackingCompleted = 0;
            }
            
            const isCompleted = trackingTotal > 0 && trackingCompleted === trackingTotal;

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
                      <Library className="h-3 w-3" style={{ color: roadmap.color }} />
                      <span>{(step as any).attachedModules?.length || 0} Modules</span>
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

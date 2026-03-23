import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronLeft, Library, Map } from "lucide-react";

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

  if (!roadmap || roadmap.status !== "PUBLISHED") notFound();

  // 1. Calculate global stats with mutual exclusivity (Track Steps Checked)
  const stepsCompleted = roadmap.steps.reduce((acc, step) => {
    const hasModules = (step as any).attachedModules?.length > 0;
    let trackingTotal = 0;
    let trackingCompleted = 0;

    if (hasModules) {
      (step as any).attachedModules.forEach((am: any) => {
        trackingTotal += am.module.topics?.length || 0;
        trackingCompleted += (am.module.topics || []).filter((t: any) => completedItemIds.has(t.id)).length;
      });
    }
    
    // Check if step is done
    const isCompleted = trackingTotal > 0 && trackingCompleted === trackingTotal;
    return acc + (isCompleted ? 1 : 0);
  }, 0);

  const totalTopics = roadmap.steps.reduce((acc, step) => {
    const hasModules = (step as any).attachedModules?.length > 0;
    if (hasModules) {
      const moduleTopics = (step as any).attachedModules.reduce(
        (sum: number, am: any) => sum + (am.module.topics?.length || 0), 0
      );
      return acc + moduleTopics;
    }
    return acc + step._count.topics;
  }, 0);

  const globalPercentage = roadmap.steps.length > 0 ? Math.round((stepsCompleted / roadmap.steps.length) * 100) : 0;

  const getMotivation = (p: number) => {
    if (p === 0) return "Just getting started";
    if (p < 30) return "Solid start, keep going!";
    if (p < 70) return "Making great progress!";
    if (p < 100) return "Almost there, finish strong!";
    return "Roadmap mastered! 🎉";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── HIGH END HERO SECTION ── */}
      <div className="relative border-b bg-card/[0.15] backdrop-blur overflow-hidden">
        <div 
          className="absolute inset-x-0 -top-40 -z-10 m-auto h-[380px] w-full max-w-4xl rounded-full blur-[110px]" 
          style={{ backgroundImage: `radial-gradient(circle at center, ${roadmap.color}0d, ${roadmap.color}04, transparent)` }}
        />

        <div className="container px-6 py-12 md:py-16 max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
            <div className="flex-1 space-y-5 text-left">
                <Link href="/roadmap" className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-2">
                     <ChevronLeft className="h-3.5 w-3.5" /> Back to Roadmaps
                </Link>

                <div className="space-y-4">
                    <div className="flex items-center gap-3.5">
                       <div className="text-4xl h-14 w-14 rounded-2xl flex items-center justify-center bg-card border border-border/40 shadow-sm shrink-0" style={{ boxShadow: `0 0 20px ${roadmap.color}10` }}>{roadmap.icon}</div>
                       <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">{roadmap.title}</h1>
                    </div>
                    <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed">
                        {roadmap.description}
                    </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-border/10 bg-muted/20 px-3.5 py-1 text-[11px] font-bold text-foreground/90 shadow-sm">
                    <Map className="h-3.5 w-3.5" style={{ color: roadmap.color }} />
                    {roadmap.steps.length} Steps
                </div>
            </div>

            {/* Right: Achievement Progress Ring Card */}
            <div className="w-full md:w-auto shrink-0">
               <div className="border border-border/40 bg-card rounded-3xl p-6 shadow-xl w-full md:w-64 flex flex-row md:flex-col items-center justify-between md:justify-center gap-5 relative group overflow-hidden bg-gradient-to-b from-card to-background/50">
                    <div className="relative h-20 w-20 flex items-center justify-center bg-background rounded-2xl border border-border/30 shadow-inner p-1">
                         <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                              <path className="stroke-muted/20" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                              <path className="stroke-emerald-500 transition-all duration-1000 ease-out" strokeWidth="4" fill="none" strokeDasharray={`${globalPercentage}, 100`} strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center font-black text-emerald-500">
                              <span className="text-[14px] font-black leading-none">{globalPercentage}%</span>
                         </div>
                    </div>

                    <div className="text-left md:text-center space-y-0.5">
                         <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">{getMotivation(globalPercentage)}</span>
                         <h4 className="text-xs font-bold text-foreground">Steps Mastered</h4>
                         <p className="text-[11px] text-muted-foreground font-medium pt-0.5">{stepsCompleted} of {roadmap.steps.length} completed</p>
                    </div>
               </div>
            </div>
        </div>
      </div>

      <div className="container px-6 py-12 m-auto max-w-5xl">
          <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                 Your Learning Path
              </h2>
              <p className="text-muted-foreground text-sm pt-1 mt-1">Follow the modules sequentially for optimal understanding.</p>
          </div>

        <div className="space-y-6 relative">
          {roadmap.steps.map((step, i) => {
            const hasModules = (step as any).attachedModules?.length > 0;
            let trackingTotal = 0;
            let trackingCompleted = 0;

            if (hasModules) {
              (step as any).attachedModules.forEach((am: any) => {
                trackingTotal += am.module.topics?.length || 0;
                trackingCompleted += (am.module.topics || []).filter((t: any) => completedItemIds.has(t.id)).length;
              });
            } else {
              trackingTotal = 0;
              trackingCompleted = 0;
            }
            
            const isCompleted = trackingTotal > 0 && trackingCompleted === trackingTotal;

            return (
            <Link
              key={step.id}
              href={`/roadmap/${roadmap.id}/${step.id}`}
              className="block relative z-10 group"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-8 relative">
                  {i < roadmap.steps.length - 1 && (
                     <div 
                        className={`absolute top-16 bottom-[-24px] left-8 w-1 hidden sm:block -z-10 transition-all duration-500`}
                        style={{ backgroundColor: isCompleted ? '#10b981' : `${roadmap.color}35` }}
                     />
                  )}
                  
                {/* Station Node */}
                <div className="flex items-center gap-4 shrink-0 sm:w-16">
                  <div
                    className={`hidden sm:flex w-16 h-16 rounded-2xl border shadow-sm items-center justify-center relative z-20 group-hover:scale-110 transition-transform duration-300 ${isCompleted ? "shadow-[0_0_15px_rgba(16,185,129,0.4)] bg-card border-emerald-500 scale-105" : "bg-card"}`}
                    style={{ borderColor: isCompleted ? '#10b981' : `${roadmap.color}50` }}
                  >
                    <span className="text-xl font-black" style={{ color: isCompleted ? '#10b981' : roadmap.color }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div
                    className={`sm:hidden w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 ${isCompleted ? "bg-emerald-500/10 border-emerald-500" : "bg-card"}`}
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

                  <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/50 text-xs sm:text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-md">
                      <Library className="h-4 w-4" style={{ color: roadmap.color }} />
                      <span>{(step as any).attachedModules?.length || 0} Modules</span>
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

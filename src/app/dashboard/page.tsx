import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractYouTubeId, isYouTubeType } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, Lightbulb, Map, Bookmark, Lock, Bell, Calendar, FileText, Database, ArrowRight, ArrowUpRight, Shield, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { DashboardClient } from "@/components/dashboard-client";
import { ResourceCard } from "@/components/resource-card";
import { MessageCircle, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch standard components
  const announcements = await prisma.announcement.findMany({ where: { isPinned: true }, orderBy: { createdAt: "desc" } });
  const latestModules = await prisma.roadmapStep.findMany({ orderBy: { createdAt: "desc" }, take: 4, include: { roadmap: { select: { title: true, color: true } }, _count: { select: { topics: true } } } });
  
  const latestResources = await prisma.resource.findMany({ 
    where: { status: "PUBLISHED" }, 
    orderBy: { createdAt: "desc" }, 
    take: 2,
    include: {
      author: { select: { fullName: true } },
      _count: { select: { upvotes: true } },
      upvotes: {
        where: { userId: session.user.id },
        select: { id: true }
      }
    }
  });

  const upcomingEvents = await prisma.event.findMany({ where: { startTime: { gte: new Date() }, status: "PUBLISHED" }, orderBy: { startTime: "asc" }, take: 3 });
  const mySubmissions = await prisma.event.findMany({ where: { authorId: session.user.id }, orderBy: { createdAt: "desc" }, take: 4 });

  // 1. Fetch data Payloads efficiently
  const [userProgress, rawRoadmaps] = await Promise.all([
     prisma.userProgress.findMany({ 
       where: { userId: session.user.id }, 
       orderBy: { createdAt: "desc" },
       select: { id: true, itemId: true, createdAt: true }
     }),
     prisma.roadmap.findMany({
         where: { status: "PUBLISHED" },
         select: {
           id: true,
           title: true,
           icon: true,
           color: true,
           description: true,
           createdAt: true,
           updatedAt: true,
           status: true,
           order: true,
           steps: {
             where: { status: "PUBLISHED" },
             select: {
               id: true,
               attachedModules: {
                 select: {
                   isOptional: true,
                   module: {
                     select: {
                       topics: { select: { id: true } }
                     }
                   }
                 }
               }
             }
           }
         }
     })
  ]);

  const completedItemIds = new Set(userProgress.map((p: any) => p.itemId));

  // Determine which roadmap is "Current" based on the most recent activity
  const recentTopicId = userProgress[0]?.itemId;
  
  const roadmapsWithProgress = (rawRoadmaps as any[]).map((roadmap: any) => {
    let completedSteps = 0;
    let completedTopics = 0;
    let totalTopics = 0;

    roadmap.steps.forEach((step: any) => {
       let stepTotal = 0;
       let stepCompleted = 0;
       
       step.attachedModules.forEach((am: any) => {
         const isOptional = (am as any).isOptional;
         am.module.topics.forEach((t: any) => {
           if (!isOptional) {
             stepTotal++; totalTopics++;
           }
           if (completedItemIds.has(t.id)) {
             if (!isOptional) stepCompleted++; 
             completedTopics++;
           }
         });
       });
       
       if (stepTotal > 0 && stepCompleted === stepTotal) completedSteps++;
    });

    const hasRecentActivity = roadmap.steps.some((s: any) => s.attachedModules.some((am: any) => am.module.topics.some((t: any) => t.id === recentTopicId)));

    return {
       ...roadmap,
       totalSteps: roadmap.steps.length,
       completedSteps,
       totalTopics,
       completedTopics,
       percent: roadmap.steps.length > 0 ? Math.round((completedSteps / roadmap.steps.length) * 100) : 0,
       hasRecentActivity
    };
  });

  const currentRoadmap = roadmapsWithProgress.find(r => r.hasRecentActivity) || roadmapsWithProgress.find(r => r.completedTopics > 0) || null;

  // Calculate modules completed (Bonus Points)
  // To avoid fetching everything again, we can estimate or fetch only completed modules
  const modulesWithAllTopics = await prisma.roadmapStep.findMany({
    where: { 
      attachedModules: { some: {} },
      status: "PUBLISHED" 
    },
    include: { topics: { select: { id: true } } }
  });
  
  let modulesCompletedCount = 0;
  // (Simplified for now to keep performance high)
  roadmapsWithProgress.forEach((r: any) => {
    if (r.percent === 100) modulesCompletedCount += r.totalSteps;
  });

  const roadmapsCompletedCount = roadmapsWithProgress.filter((r: any) => r.percent === 100).length;
  const pointTotals = (userProgress.length * 10) + (modulesCompletedCount * 50) + (roadmapsCompletedCount * 500);

  const getLevel = (points: number) => {
     if (points < 200) return { title: "Newcomer", next: 200 };
     if (points < 500) return { title: "Explorer", next: 500 };
     if (points < 1000) return { title: "Learner", next: 1000 };
     if (points < 2500) return { title: "Practitioner", next: 2500 };
     if (points < 5000) return { title: "Engineer", next: 5000 };
     return { title: "DevOps Pro", next: points };
  };

  const currentLevel = getLevel(pointTotals);
  const nextLevelPercent = Math.min(Math.round((pointTotals / currentLevel.next) * 100), 100);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-card/60 border border-border/10 shadow-md hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-all duration-700 hover:-translate-y-1 group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-muted/20 z-0"></div>
        {/* Backlight flare hover animationwardsWARDS. */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-1000 blur-3xl pointer-events-none bg-primary" />
        <div className="relative z-10 px-8 py-10 md:py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">{session.user.name || session.user.email?.split("@")[0]}</span>
            </h1>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-full text-sm">
               <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
               {pointTotals} Points ({currentLevel.title})
            </div>
            <p className="text-muted-foreground md:text-lg pt-1">
              Here's your highly customized dashboard. Discover new architectures, prepare for certifications, and expand your DevOps skills.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="/modules">
                <Button className="rounded-full shadow-lg">Explore Modules</Button>
              </Link>
               {session?.user?.role === "MEMBER" && (
                 <Link href="/request-admin">
                    <Button variant="outline" className="rounded-full border-amber-500/20 hover:bg-amber-500/10 text-amber-500"><Shield className="h-4 w-4 mr-1.5" /> Apply for Admin</Button>
                 </Link>
               )}
              <Link href="/roadmap">
                <Button variant="secondary" className="rounded-full">View Roadmap</Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center gap-3">
            <Link href="/dashboard" className="h-32 w-32 shrink-0 rounded-full border-4 border-background shadow-xl bg-primary/10 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-500 cursor-pointer">
               {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover" />
               ) : (
                  <Terminal className="h-12 w-12 text-primary" />
               )}
            </Link>
            <div className="text-center space-y-1">
               <span className="text-sm font-bold text-foreground/90">{session.user.name}</span>
               {(session.user as any).resumeUrl && (
                  <a href={(session.user as any).resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center justify-center gap-1 font-semibold">
                     <FileText className="h-3.5 w-3.5" /> View Resume
                  </a>
               )}
            </div>
          </div>
        </div>
      </div>

      <DashboardClient 
         user={{ name: session.user.name || session.user.email?.split("@")[0], pointTotals, currentLevel, nextLevelPercent }}
         currentRoadmap={currentRoadmap}
         allStats={{ topics: userProgress.length, modules: modulesCompletedCount, roadmaps: roadmapsCompletedCount, points: pointTotals }}
         progress={userProgress.map((p: any) => ({ createdAt: p.createdAt, id: p.id }))}
      />

      {/* Pinned Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-4">
          {announcements.map(announcement => (
            <div key={announcement.id} className="bg-primary/5 border border-primary/20 p-5 rounded-2xl flex items-start gap-4">
              <div className="bg-background rounded-full p-2 border shadow-sm">
                 <Bell className="h-5 w-5 text-primary flex-shrink-0" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Pinned Announcement</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{announcement.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Latest Modules */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-border/10">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Terminal className="h-6 w-6 text-primary" /> Latest Modules
              </h2>
              <Link href="/modules">
                <Button variant="ghost" size="sm" className="group text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
                  View all <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            {latestModules.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {latestModules.map(mod => (
                  <Card key={mod.id} className="group overflow-hidden flex flex-col backdrop-blur-3xl bg-card/30 border border-border/10 rounded-[1.5rem] shadow-sm hover:shadow-[0_25px_50px_rgba(0,0,0,0.1)] hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 cursor-pointer relative">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-3xl pointer-events-none" style={{ backgroundColor: mod.roadmap?.color || "#3B82F6" }} />
                    <Link href={`/modules?id=${mod.id}`} className="absolute inset-0 z-10"><span className="sr-only">View</span></Link>
                    <div className="h-1.5 w-full" style={{ backgroundColor: mod.roadmap?.color || "#3B82F6" }} />
                    <CardHeader className="p-6 pb-3">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/60 bg-muted/30 px-2.5 py-1 rounded-lg border border-border/5">{mod.icon} Module</span>
                        <span className="text-[10px] font-black text-primary/70">{mod._count.topics} Topics</span>
                      </div>
                      <CardTitle className="text-lg font-black leading-tight group-hover:text-primary transition-colors pr-4">{mod.title}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : <p className="text-muted-foreground text-sm font-medium">No modules available</p>}
          </section>

          {/* Latest Resources */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-border/10">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Database className="h-6 w-6 text-primary" /> Curated Resources
              </h2>
              <Link href="/resources">
                <Button variant="ghost" size="sm" className="group text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
                  View all
                </Button>
              </Link>
            </div>
            {latestResources.length > 0 ? (
               <div className="grid sm:grid-cols-2 gap-6">
                 {latestResources.map(r => (
                    <ResourceCard key={r.id} resource={r as any} />
                 ))}
               </div>
            ) : <p className="text-muted-foreground text-sm font-medium">No resources available</p>}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Event Submissions */}
          <Card className="bg-card/35 backdrop-blur-3xl border border-border/10 overflow-hidden rounded-[1.5rem] shadow-sm hover:shadow-lg transition-all border-l-4 border-l-primary/30 group">
            <CardHeader className="bg-muted/10 border-b border-border/5 p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                   <Zap className="h-4 w-4 text-primary" />
                   <CardTitle className="text-xs font-black uppercase tracking-widest">My Submissions</CardTitle>
                </div>
                <Link href="/events/new">
                    <Button variant="outline" className="text-[9px] h-7 px-3 rounded-xl flex items-center gap-1.5 font-black uppercase tracking-tighter border-primary/20 text-primary hover:bg-primary/10 hover:border-primary transition-all shadow-sm active:scale-95 leading-none">
                        + Submit
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="p-0"> 
                {mySubmissions.length > 0 ? (
                    <div className="divide-y divide-border/5">
                        {mySubmissions.map(e => (
                             <Link key={e.id} href={`/events/dashboard/edit/${e.id}`} className="block p-4 space-y-1.5 hover:bg-primary/[0.03] transition-all group/item">
                                 <div className="flex justify-between items-start gap-2">
                                     <p className="font-bold text-sm leading-tight text-foreground/90 group-hover/item:text-primary transition-colors line-clamp-2">{e.title}</p>
                                     <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${e.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]' : 'bg-amber-500/10 text-amber-500 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]'}`}>{e.status}</span>
                                 </div>
                                 <p className="text-[11px] text-muted-foreground line-clamp-1 font-bold">{e.description}</p>
                                 <div className="flex items-center gap-1.5 text-[9px] text-primary/70 transition-all pt-1 font-black uppercase tracking-tight">
                                     Manage Submission <ArrowUpRight className="h-2.5 w-2.5" />
                                 </div>
                             </Link>
                        ))}
                    </div>
                ) : <p className="p-8 text-center text-xs font-bold text-muted-foreground/40 italic uppercase tracking-widest">No nodes submitted</p>} 
                 {mySubmissions.length > 0 && (
                     <div className="p-3 bg-muted/5 border-t border-border/5">
                         <Link href="/events/dashboard">
                              <Button variant="ghost" size="sm" className="w-full text-[10px] h-8 text-muted-foreground font-black uppercase tracking-widest hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                  Go to Studio
                              </Button>
                         </Link>
                     </div>
                 )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-card/35 backdrop-blur-3xl border border-border/10 overflow-hidden rounded-[1.5rem] shadow-sm hover:shadow-lg transition-all group">
            <CardHeader className="bg-muted/10 border-b border-border/5 p-4 flex items-center justify-between flex-row">
               <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <CardTitle className="text-xs font-black uppercase tracking-widest">Coming Live</CardTitle>
               </div>
               <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
            </CardHeader>
            <CardContent className="p-0"> 
                 {upcomingEvents.length > 0 ? (
                    <div className="divide-y divide-border/5">
                         {upcomingEvents.map(e => (
                              <Link key={e.id} href={`/events?filter=all`} className="block p-4 space-y-2 hover:bg-primary/[0.03] transition-all group/event">
                                  <div className="flex justify-between items-start gap-1">
                                      <p className="font-bold text-sm text-foreground/90 group-hover/event:text-primary transition-colors leading-tight">{e.title}</p>
                                      <div className="h-7 w-7 rounded-full bg-muted/20 flex items-center justify-center group-hover/event:bg-primary/10 transition-colors">
                                        <Clock className="h-3.5 w-3.5 text-primary" />
                                      </div>
                                  </div>
                                  <div className="flex items-center justify-between pt-1">
                                      <div className="flex flex-col">
                                         <p className="text-[10px] font-black uppercase text-muted-foreground/70">{new Date(e.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                         <p className="text-[11px] font-bold text-muted-foreground/40 leading-none">{new Date(e.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                      </div>
                                      <span className="text-[10px] font-black uppercase tracking-tighter text-primary/80 transition-all group-hover/event:text-primary">Join Terminal →</span>
                                  </div>
                              </Link>
                         ))}
                    </div>
                 ) : <p className="p-8 text-center text-xs font-bold text-muted-foreground/40 italic uppercase tracking-widest">Quiet in the network</p>} 
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="overflow-hidden rounded-[1.5rem] border border-border/10 bg-card/35 backdrop-blur-3xl shadow-sm hover:shadow-xl transition-all hover:border-primary/20 group">
            <CardContent className="p-2.5">
              <Link href="/bookmarks" className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-primary/5 transition-all text-sm group">
                <div className="flex items-center gap-4">
                   <div className="bg-primary shadow-[0_0_15px_rgba(var(--primary),0.3)] p-2.5 rounded-[1rem] group-hover:scale-110 transition-transform">
                      <Bookmark className="h-4 w-4 text-white fill-current" />
                   </div>
                   <div>
                      <h4 className="font-black uppercase text-[11px] tracking-widest leading-none">Saves & Reminders</h4>
                      <p className="text-[10px] font-bold text-muted-foreground/80 tracking-tight mt-1">Bookmarked Resources</p>
                   </div>
                </div >
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-2 transition-transform group-hover:text-primary" />
              </Link >
            </CardContent>
          </Card>

          {/* Coming Soon Locked */}
          <div className="space-y-5 pt-2 px-3 border-t border-border/10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2 pl-1">Proprietary Nodes</h3>
            <div className="grid gap-3">
                {[
                    { icon: <Terminal className="h-4 w-4 text-primary" />, title: "Interview Prep", desc: "Industry interview questions and absolute preparation tracks." },
                    { icon: <MessageCircle className="h-4 w-4 text-primary" />, title: "Community Chat", desc: "Interact and share nodes directly with other loaded students." },
                    { icon: <BookOpen className="h-4 w-4 text-primary" />, title: "Curated Courses", desc: "Best video/courses libraries bucketed proportionally elegantly." },
                    { icon: <FileText className="h-4 w-4 text-primary" />, title: "Module Notes", desc: "Take core notes directly from any topic screen natively." }
                ].map((item, i) => (
                    <details key={i} className="group border border-border/5 rounded-2xl p-4 bg-muted/[0.03] backdrop-blur-sm transition-all hover:bg-muted/10 cursor-pointer overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1 h-0 bg-primary group-open:h-full transition-all duration-500" />
                        <summary className="flex items-center justify-between list-none">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-background/50 rounded-xl border border-border/5 group-hover:bg-primary/10 transition-colors">
                                  {item.icon}
                                </div>
                                <p className="text-[13px] font-black uppercase tracking-tight text-foreground/80">{item.title}</p>
                            </div>
                            <span className="text-muted-foreground/30 group-open:rotate-180 transition-transform text-[10px] font-black">▼</span>
                        </summary>
                        <p className="text-xs text-muted-foreground mt-3 pl-12 leading-relaxed font-bold border-l border-border/10 ml-4 py-1">{item.desc}</p>
                    </details>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

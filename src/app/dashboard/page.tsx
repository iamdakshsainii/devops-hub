import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractYouTubeId, isYouTubeType } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, Lightbulb, Map, Bookmark, Lock, Bell, Calendar, FileText, Database, ArrowRight, ArrowUpRight, Shield, Clock } from "lucide-react";
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
      _count: { select: { upvotes: true } }
    }
  });

  const upcomingEvents = await prisma.event.findMany({ where: { startTime: { gte: new Date() }, status: "PUBLISHED" }, orderBy: { startTime: "asc" }, take: 3 });
  const mySubmissions = await prisma.event.findMany({ where: { authorId: session.user.id }, orderBy: { createdAt: "desc" }, take: 4 });

  // 1. Fetch data Payloads supporting absolute tracking comfortably responsibly
  const [userProgress, roadmaps, modulesWithTopics] = await Promise.all([
     prisma.userProgress.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "asc" } }),
     prisma.roadmap.findMany({
         where: { status: "PUBLISHED" },
         include: {
           steps: {
             where: { status: "PUBLISHED" },
             include: {
                attachedModules: { include: { module: { include: { topics: { select: { id: true } } } } } }
             }
           }
         }
     }),
     prisma.roadmapStepModule.findMany({
         include: { module: { include: { topics: { select: { id: true } } } } }
     })
  ]);

  const completedItemIds = new Set(userProgress.map(p => p.itemId));

  // Calculate Roadmap Progress
  const roadmapsWithProgress = roadmaps.map(roadmap => {
    let totalSteps = roadmap.steps.length;
    let completedSteps = 0;
    let totalTopics = 0;
    let completedTopics = 0;
    let lastActivity = new Date(0);

    roadmap.steps.forEach(step => {
       const hasModules = (step as any).attachedModules?.length > 0;
       let stepTotal = 0;
       let stepCompleted = 0;

       if (hasModules) {
         (step as any).attachedModules.forEach((am: any) => {
           (am.module.topics || []).forEach((t: any) => {
              stepTotal++; totalTopics++;
              if (completedItemIds.has(t.id)) {
                 stepCompleted++; completedTopics++;
                 const prog = userProgress.find(p => p.itemId === t.id);
                 if (prog && new Date(prog.createdAt) > lastActivity) lastActivity = new Date(prog.createdAt);
              }
           });
         });
       }
       if (stepTotal > 0 && stepCompleted === stepTotal) completedSteps++;
    });

    return {
       id: roadmap.id, title: roadmap.title, icon: roadmap.icon, color: roadmap.color, description: roadmap.description,
       percent: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
       totalSteps, completedSteps, totalTopics, completedTopics, lastActivity
    };
  });

  const activeRoadmaps = roadmapsWithProgress.filter(r => r.completedTopics > 0);
  activeRoadmaps.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  const currentRoadmap = activeRoadmaps[0] || null;

  let modulesCompletedCount = 0;
  modulesWithTopics.forEach(am => {
     const topicsCount = am.module.topics.length;
     if (topicsCount > 0 && am.module.topics.every(t => completedItemIds.has(t.id))) {
        modulesCompletedCount++;
     }
  });

  const roadmapsCompletedCount = roadmapsWithProgress.filter(r => r.percent === 100).length;
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
      <div className="relative overflow-hidden rounded-3xl bg-card border shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-muted/20 z-0"></div>
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
          <div className="hidden md:flex h-32 w-32 shrink-0 rounded-full border-4 border-background shadow-xl bg-primary/10 items-center justify-center">
             <Terminal className="h-12 w-12 text-primary" />
          </div>
        </div>
      </div>

      <DashboardClient 
         user={{ name: session.user.name || session.user.email?.split("@")[0], pointTotals, currentLevel, nextLevelPercent }}
         currentRoadmap={currentRoadmap}
         allStats={{ topics: userProgress.length, modules: modulesCompletedCount, roadmaps: roadmapsCompletedCount, points: pointTotals }}
         progress={userProgress.map(p => ({ createdAt: p.createdAt, id: p.id }))}
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
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Terminal className="h-6 w-6 text-primary" /> Latest Modules
              </h2>
              <Link href="/modules"><Button variant="ghost" size="sm" className="group">View all <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></Button></Link>
            </div>
            {latestModules.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {latestModules.map(mod => (
                  <Card key={mod.id} className="group overflow-hidden flex flex-col hover:border-foreground/30 transition-all hover:shadow-md cursor-pointer relative">
                    <Link href={`/modules?id=${mod.id}`} className="absolute inset-0 z-10"><span className="sr-only">View</span></Link>
                    <div className="h-1" style={{ backgroundColor: mod.roadmap?.color || "#3B82F6" }} />
                    <CardHeader className="p-5 pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">{mod.icon} Module</span>
                        <span className="text-xs text-muted-foreground">{mod._count.topics} Topics</span>
                      </div>
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{mod.title}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : <p className="text-muted-foreground text-sm">No modules share setup</p>}
          </section>

          {/* Latest Resources */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" /> Curated Resources
              </h2>
              <Link href="/resources"><Button variant="ghost" size="sm" className="group">View all</Button></Link>
            </div>
            {latestResources.length > 0 ? (
               <div className="grid sm:grid-cols-2 gap-6">
                 {latestResources.map(r => (
                    <ResourceCard key={r.id} resource={r as any} />
                 ))}
               </div>
            ) : <p className="text-muted-foreground text-sm">No resources available</p>}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Event Submissions */}
          <Card className="bg-card/50 border overflow-hidden rounded-2xl">
            <CardHeader className="bg-muted/30 border-b p-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold">Event Submissions</CardTitle>
                <Link href="/events/new">
                    <Button variant="outline" className="text-[10px] h-6 px-2.5 rounded-lg flex items-center gap-1 font-bold border-primary/20 text-primary hover:bg-primary/5">
                        + Submit
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="p-0"> 
                {mySubmissions.length > 0 ? (
                    <div className="divide-y divide-border/40">
                        {mySubmissions.map(e => (
                             <div key={e.id} className="p-4 space-y-1">
                                 <div className="flex justify-between items-start gap-2">
                                     <p className="font-semibold text-sm leading-snug">{e.title}</p>
                                     <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${e.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{e.status}</span>
                                 </div>
                                 <p className="text-xs text-muted-foreground line-clamp-1">{e.description}</p>
                             </div>
                        ))}
                    </div>
                ) : <p className="p-6 text-center text-sm text-muted-foreground">No submissions yet.</p>} 
                 {mySubmissions.length > 0 && (
                     <div className="p-2 border-t border-border/40">
                         <Link href="/events/dashboard">
                              <Button variant="ghost" size="sm" className="w-full text-[11px] h-7 text-muted-foreground hover:text-foreground">
                                  Manage Submissions
                              </Button>
                         </Link>
                     </div>
                 )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-card/50 border overflow-hidden rounded-2xl">
            <CardHeader className="bg-muted/30 border-b pb-3"><CardTitle className="text-sm font-bold">Upcoming Events</CardTitle></CardHeader>
            <CardContent className="p-0"> 
                 {upcomingEvents.length > 0 ? (
                    <div className="divide-y divide-border/40">
                         {upcomingEvents.map(e => (
                              <div key={e.id} className="p-4 space-y-1.5 hover:bg-muted/30 transition-colors">
                                  <div className="flex justify-between items-center gap-1">
                                      <p className="font-semibold text-sm">{e.title}</p>
                                      <Clock className="h-3 w-3 text-primary" />
                                  </div>
                                  <p className="text-[11px] text-muted-foreground">{new Date(e.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                         ))}
                    </div>
                 ) : <p className="p-6 text-center text-sm text-muted-foreground">No upcoming events.</p>} 
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="overflow-hidden rounded-2xl border bg-card/50 shadow-sm">
            <CardContent className="p-2 space-y-1">
              <Link href="/bookmarks" className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors font-semibold text-sm group">
                <div className="flex items-center gap-3"><div className="bg-primary/10 p-2 rounded-xl"><Bookmark className="h-4 w-4 text-primary" /></div>Saves & Reminders</div >
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link >
            </CardContent>
          </Card>

          {/* Coming Soon Locked */}
          <div className="space-y-4 pt-1 px-2 border-t">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">Coming Soon</h3>
            <div className="grid gap-2">
                {[
                    { icon: <Terminal className="h-4 w-4 text-primary/60" />, title: "Interview Prep", desc: "Industry interview questions and absolute preparation tracks." },
                    { icon: <MessageCircle className="h-4 w-4 text-primary/60" />, title: "Community Chat", desc: "Interact and share nodes directly with other loaded students." },
                    { icon: <BookOpen className="h-4 w-4 text-primary/60" />, title: "Curated Courses", desc: "Best video/courses libraries bucketed proportionally elegantly." },
                    { icon: <FileText className="h-4 w-4 text-primary/60" />, title: "Module Notes", desc: "Take core notes directly from any topic screen natively." }
                ].map((item, i) => (
                    <details key={i} className="group border border-dashed rounded-xl p-3 bg-muted/10 transition-all hover:bg-muted/20 cursor-pointer">
                        <summary className="flex items-center justify-between list-none">
                            <div className="flex items-center gap-3">
                                {item.icon}
                                <p className="text-sm font-bold text-foreground/80">{item.title}</p>
                            </div>
                            <span className="text-muted-foreground/40 group-open:rotate-180 transition-transform text-[10px]">▼</span>
                        </summary>
                        <p className="text-xs text-muted-foreground/70 mt-2 pl-7 leading-relaxed font-medium">{item.desc}</p>
                    </details>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

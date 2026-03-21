import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractYouTubeId, isYouTubeType } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, Lightbulb, Map, Bookmark, Lock, Bell, Calendar, FileText, Database, ArrowRight, ArrowUpRight, Shield } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch pinned announcements
  const announcements = await prisma.announcement.findMany({
    where: { isPinned: true },
    orderBy: { createdAt: "desc" }
  });

  // Fetch latest modules (steps)
  const latestModules = await prisma.roadmapStep.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { roadmap: { select: { title: true, color: true } }, _count: { select: { topics: true } } }
  });

  // Fetch latest resources
  const latestResources = await prisma.resource.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 2,
  });

  // Fetch upcoming events
  const upcomingEvents = await prisma.event.findMany({
    where: { 
      startTime: { gte: new Date() },
      status: "PUBLISHED"
    },
    orderBy: { startTime: "asc" },
    take: 3,
  });

  // Fetch author's own submitted events to track progress
  const mySubmissions = await prisma.event.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 4
  });

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { score: true }
  });

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
               {me?.score || 0} Community Credits Earned
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
                    <Link href={`/modules?id=${mod.id}`} className="absolute inset-0 z-10">
                      <span className="sr-only">View Module</span>
                    </Link>
                    <div className="h-1" style={{ backgroundColor: mod.roadmap?.color || "#3B82F6" }} />
                    <CardHeader className="p-5 pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {mod.icon} Module 
                        </span>
                        <span className="text-xs text-muted-foreground">{mod._count.topics} Topics</span>
                      </div>
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{mod.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-1 mt-auto">
                      <p className="text-xs text-muted-foreground line-clamp-2">{mod.description || "Standalone knowledge node."}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 py-16 border rounded-2xl bg-muted/5 border-dashed">
                <Terminal className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No modules published yet.</p>
              </div>
            )}
          </section>

          {/* Latest Resources */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" /> Curated Resources
              </h2>
              <Link href="/resources"><Button variant="ghost" size="sm" className="group">View all <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></Button></Link>
            </div>
            {latestResources.length > 0 ? (
               <div className="grid sm:grid-cols-2 gap-6">
                {latestResources.map(resource => {
                  const youtubeId = isYouTubeType(resource.type)
                    ? extractYouTubeId(resource.url || "")
                    : null;
                  const finalImageUrl =
                    resource.imageUrl ||
                    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null);

                  return (
                    <Card key={resource.id} className="group overflow-hidden flex flex-col hover:border-foreground/30 transition-all hover:shadow-md cursor-pointer relative">
                      <Link href={`/resources/${resource.id}`} className="absolute inset-0 z-10">
                        <span className="sr-only">View Resource</span>
                      </Link>
                      <div className="h-1 bg-indigo-500" />
                      {finalImageUrl && (
                        <div className="h-36 overflow-hidden relative border-b bg-muted/20">
                           <img src={finalImageUrl} alt={resource.title || "Resource"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                    <CardHeader className="p-5 pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {resource.type}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">Check it out <ArrowUpRight className="h-3 w-3" /></span>
                      </div>
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{resource.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-1 mt-auto">
                      <p className="text-xs text-muted-foreground line-clamp-2">{resource.description || "Standalone curated item"}</p>
                    </CardContent>
                    </Card>
                  );
                })}
               </div>
            ) : (
              <div className="text-center p-12 py-16 border rounded-2xl bg-muted/5 border-dashed">
                <Database className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No resources shared yet.</p>
              </div>
            )}
          </section>

        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          {/* My Event Submissions */}
          <Card className="bg-card/50 border overflow-hidden rounded-2xl">
            <CardHeader className="bg-muted/30 border-b pb-4">
               <div className="flex items-center justify-between w-full">
                 <div className="flex flex-col">
                   <div className="flex items-center gap-2">
                     <FileText className="h-5 w-5 text-primary" />
                     <CardTitle className="text-base font-bold">My Event Submissions</CardTitle>
                   </div>
                   <CardDescription className="text-[11px] text-muted-foreground mt-1">Host & manage your community events, webinars, and meetups.</CardDescription>
                 </div>
                 <Link href="/events/dashboard">
                   <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2 py-0">
                     Track All <ArrowRight className="h-3.5 w-3.5 ml-1" />
                   </Button>
                 </Link>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               {mySubmissions.length > 0 ? (
                 <div className="divide-y text-xs">
                   {mySubmissions.map(sub => (
                     <Link key={sub.id} href="/events/dashboard" className="p-4 flex flex-col space-y-2 hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start gap-2 w-full">
                          <p className="font-semibold text-[13px] line-clamp-1 leading-tight group-hover:text-primary transition-colors">{sub.title}</p>
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                            sub.status === 'PUBLISHED' ? 'text-emerald-600 bg-emerald-500/10' : 
                            sub.status === 'REJECTED' ? 'text-destructive bg-destructive/10' : 
                            'text-amber-600 bg-amber-500/10'
                          }`}>
                            {sub.status}
                          </span>
                        </div>
                        {sub.status === "REJECTED" && (
                          <div className="text-[11px] text-destructive/80 border border-destructive/20 bg-destructive/5 px-2 py-1 rounded">
                             Admin requested changes. View & Edit here.
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString()}</p>
                     </Link>
                   ))}
                 </div>
               ) : (
                 <p className="p-6 text-center text-sm text-muted-foreground border-b border-dashed">No submissions yet.</p>
               )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-card/50 border overflow-hidden rounded-2xl">
            <CardHeader className="bg-muted/30 border-b pb-4">
               <div className="flex items-center gap-2">
                 <Calendar className="h-5 w-5 text-primary" />
                 <CardTitle className="text-base font-bold">Upcoming Events</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingEvents.length > 0 ? (
                <div className="divide-y">
                  {upcomingEvents.map(event => (
                    <Link key={event.id} href="/events" className="p-4 hover:bg-muted/50 transition-colors flex flex-col cursor-pointer group">
                      <p className="font-semibold text-sm leading-tight mb-2 group-hover:text-primary">{event.title}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs font-medium text-muted-foreground gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(event.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 group-hover:bg-primary group-hover:text-primary-foreground">RSVP</Button>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No upcoming events right now. Check back later!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="overflow-hidden rounded-2xl border-none ring-1 ring-border shadow-sm">
            <CardContent className="p-2 space-y-1">
              <Link href="/bookmarks" className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors font-medium text-sm group">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors"><Bookmark className="h-4 w-4 text-primary" /></div>
                  Saves / Remind
                </div >
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link >
              <Link href="/roadmap" className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors font-medium text-sm group">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors"><Map className="h-4 w-4 text-primary" /></div>
                  Learning Roadmap
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            </CardContent>
          </Card>

          {/* Coming Soon Locked */}
          <div className="space-y-4 pt-4 border-t px-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span> Pipeline Roadmap
            </h3>

            <div className="group border border-dashed rounded-xl p-4 bg-background/40 backdrop-blur-sm flex items-start gap-4 transition-all hover:border-primary/30 cursor-not-allowed">
              <div className="bg-muted-foreground/10 rounded-full p-2 border shadow-sm group-hover:bg-primary/5 transition-colors">
                <Terminal className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold flex items-center gap-1.5">Interview Prep <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">Planned</span></p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Solve real mock scenarios, check dynamic flashcards loaded with CI/CD benchmark guides.</p>
              </div>
            </div>

            <div className="group border border-emerald-500/20 border-dashed rounded-xl p-4 bg-emerald-500/3 backdrop-blur-sm flex items-start gap-4 transition-all hover:border-emerald-500/40 cursor-not-allowed">
              <div className="bg-emerald-500/10 rounded-full p-2 border border-emerald-500/20 shadow-sm">
                <Lightbulb className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">DevOps AI Chatbot <span className="text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold animate-pulse">Alpha</span></p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Ask anything about platform nodes, config scripts, and scaling errors natively without jumping Tabs.</p>
              </div>
            </div>

            <div className="border border-dashed rounded-xl p-4 bg-muted/10 flex items-start gap-4 opacity-70">
              <div className="bg-background rounded-full p-2 border shadow-sm">
                 <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold">Community Chat</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Discord-style real-time chat exclusively for DevOps engineers.</p>
              </div>
            </div>

            <div className="border border-dashed rounded-xl p-4 bg-muted/10 flex items-start gap-4 opacity-70">
               <div className="bg-background rounded-full p-2 border shadow-sm">
                 <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold">Job Board</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Curated platform roles. Real engineering opportunities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

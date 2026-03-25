import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, BarChart, Eye, LayoutGrid, Library } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CheatsheetContent } from "../cheatsheet-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cheatsheet = await prisma.cheatsheet.findUnique({ where: { slug }, select: { title: true, description: true } });
  if (!cheatsheet) return { title: "Not Found" };
  return { title: `${cheatsheet.title} | DevOps Hub`, description: cheatsheet.description || "Quick cheatsheets reference guide guides triggers." };
}

export default async function CheatsheetDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role);

  const cheatsheet = await (prisma.cheatsheet as any).findUnique({
    where: { slug },
    include: {
      author: { select: { fullName: true } },
      resources: { orderBy: { order: "asc" } },
      sections: {
        orderBy: { order: "asc" },
        include: { subsections: { orderBy: { order: "asc" } } }
      }
    }
  });

  if (!cheatsheet || cheatsheet.status === "DELETED") {
    return notFound();
  }

  const related = await prisma.cheatsheet.findMany({
    where: {
      category: cheatsheet.category,
      status: "PUBLISHED",
      id: { not: cheatsheet.id }
    },
    take: 3,
    orderBy: { createdAt: "desc" }
  });

  const tagList = cheatsheet.tags ? cheatsheet.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];

  const dynamicResources = tagList.length > 0 ? await prisma.resource.findMany({
    where: { status: "PUBLISHED", OR: tagList.map((tag: string) => ({ tags: { contains: tag, mode: 'insensitive' } })) },
    take: 3
  }) : [];

  const dynamicModules = tagList.length > 0 ? await prisma.roadmapStep.findMany({
    where: { OR: tagList.map((tag: string) => ({ tags: { contains: tag, mode: 'insensitive' } })) },
    take: 3
  }) : [];

  const dynamicCheatsheets = tagList.length > 0 ? await prisma.cheatsheet.findMany({
    where: { status: "PUBLISHED", OR: tagList.map((tag: string) => ({ tags: { contains: tag, mode: 'insensitive' } })), id: { not: cheatsheet.id } },
    take: 3
  }) : [];

  const dynamicBlogs = tagList.length > 0 ? await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", OR: tagList.map((tag: string) => ({ tags: { contains: tag, mode: 'insensitive' } })) },
    take: 3
  }) : [];

  const allResources = [ ...(cheatsheet.resources || []), ...dynamicResources ];

  const groupedRecommendations = [
    { title: "Resources", items: allResources.map((r: any) => ({ ...r, categoryType: "Resource", url: `/resources/${r.id}` })) },
    { title: "Modules", items: dynamicModules.map((m: any) => ({ id: m.id, title: m.title, description: "Master step workflow", type: "Module", categoryType: "Module", url: `/roadmap?stepId=${m.id}` })) },
    { title: "Cheatsheets", items: dynamicCheatsheets.map((c: any) => ({ ...c, categoryType: "Cheatsheet", url: `/cheatsheets/${c.slug}` })) },
    { title: "Blogs", items: dynamicBlogs.map((b: any) => ({ id: b.id, title: b.title, description: b.excerpt, type: "Blog", categoryType: "Blog", url: `/blog/${b.slug}` })) }
  ].filter(group => group.items.length > 0);

  const formattedDate = new Date(cheatsheet.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <Link href="/cheatsheets" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/80 px-3 py-1.5 rounded-full transition-colors mb-4">
         <ArrowLeft className="h-3.5 w-3.5" /> Back to Cheatsheets
      </Link>

      <header className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto py-10">
         <div className="flex flex-col items-center gap-4">
             <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="px-3 py-1 text-[11px] font-black uppercase tracking-widest rounded-full shadow-sm bg-primary/10 text-primary border border-primary/20">
                      {cheatsheet.category}
                  </Badge>
                  {isAdmin && (
                    <Link href={`/admin/cheatsheets/${cheatsheet.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="gap-2 h-7 rounded-full text-[10px] font-bold hover:bg-primary/5 hover:text-primary transition-all">
                           <Edit className="h-3 w-3" /> Edit Mode
                        </Button>
                    </Link>
                  )}
             </div>
             
             <div className="w-16 h-16 rounded-3xl flex items-center justify-center bg-card shadow-xl border border-border/40 text-3xl shrink-0">
                 {cheatsheet.icon}
             </div>
         </div>
         
         <div className="space-y-5">
             <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.1]">
                {cheatsheet.title}
             </h1>
             <p className="text-lg md:text-xl text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed">
                {cheatsheet.description}
             </p>
         </div>

         <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-muted-foreground bg-muted/40 w-fit px-5 py-3 rounded-full border border-border/40 shadow-sm mt-4">
             <span className="text-foreground">By {cheatsheet.author?.fullName || "Admin"}</span>
             <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
             <span>{formattedDate}</span>
             <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
             <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {cheatsheet.readTime} min read</span>
             <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
             <span className="flex items-center gap-1.5 text-primary"><BarChart className="h-3.5 w-3.5" /> {cheatsheet.difficulty}</span>
         </div>
         
         {cheatsheet.tags && (
             <div className="flex flex-wrap justify-center gap-2 mt-2">
                 {cheatsheet.tags.split(",").filter(Boolean).map((t: string) => (
                     <span key={t} className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted/30 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-default border border-border/20 shadow-sm">
                         #{t.trim()}
                     </span>
                 ))}
             </div>
         )}
      </header>

      <div className="flex flex-col lg:grid lg:grid-cols-10 gap-8 mt-10">
         {/* Main Content (7/10) */}
         <div className="lg:col-span-7">
              <CheatsheetContent sections={cheatsheet.sections} slug={slug} />
         </div>

         {/* Sidebar (3/10) */}
          <div className="lg:col-span-3 space-y-6">
              <Card className="bg-background/80 backdrop-blur-2xl rounded-[1.5rem] border border-border/30 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sticky top-24 overflow-hidden ring-1 ring-white/10 dark:ring-white/5">
                  <CardHeader className="pb-3 border-b border-border/20 bg-muted/20">
                      <CardTitle className="text-[13px] font-black uppercase tracking-wider text-muted-foreground/80">Quick Info</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4 text-sm font-semibold">
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Category</span>
                          <span className="font-bold">{cheatsheet.category}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Difficulty</span>
                          <span className="font-black text-primary px-2 py-0.5 bg-primary/10 rounded-md border border-primary/20">{cheatsheet.difficulty}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Read Time</span>
                          <span className="font-bold flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> {cheatsheet.readTime} mins</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Views</span>
                          <span className="font-bold flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-muted-foreground" /> {cheatsheet.viewCount}</span>
                      </div>
                  </CardContent>
              </Card>

              {/* Related Resources / Recommendations */}
              {groupedRecommendations.length > 0 && (
              <details className="group [&_summary::-webkit-details-marker]:hidden" open>
                  <summary className="mb-3 flex cursor-pointer items-center justify-between text-sm font-black uppercase tracking-wider text-muted-foreground/80 px-2 hover:text-primary transition-colors group">
                    <div className="flex items-center gap-2">
                       <Library className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> RECOMMENDED
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground/50 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </summary>

                  <div className="space-y-6 mt-4 animate-in fade-in-30 slide-in-from-top-1 duration-200">
                     {groupedRecommendations.map((group) => (
                        <div key={group.title} className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2 flex items-center gap-2 before:h-[2px] before:flex-1 before:bg-border/40 before:rounded-full after:h-[2px] after:flex-1 after:bg-border/40 after:rounded-full">{group.title}</h4>
                            <div className="space-y-2.5">
                               {group.items.map((r: any) => {
                                   const isVideo = r.type?.toLowerCase() === "video";
                                   const isModule = r.categoryType === "Module";
                                   const isCheatsheet = r.categoryType === "Cheatsheet";
                                   const isBlog = r.categoryType === "Blog";
                                   
                                   let colorTheme = "text-muted-foreground bg-muted/30 group-hover:bg-primary/10 group-hover:text-primary";
                                   if (isVideo) colorTheme = "text-red-500 bg-red-500/10 group-hover:bg-red-500 group-hover:text-white";
                                   else if (isModule) colorTheme = "text-indigo-500 bg-indigo-500/10 group-hover:bg-indigo-500 group-hover:text-white";
                                   else if (isBlog) colorTheme = "text-blue-500 bg-blue-500/10 group-hover:bg-blue-500 group-hover:text-white";
                                   else if (isCheatsheet) colorTheme = "text-emerald-500 bg-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-white";

                                   return (
                                    <Link key={r.id} href={r.url} className="flex flex-col gap-1.5 p-3.5 border border-border/40 rounded-2xl hover:bg-muted/30 bg-background/40 backdrop-blur-md transition-all group shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-primary/20">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 shrink-0 ${colorTheme} shadow-sm border border-black/5 dark:border-white/5`}>
                                                 {isVideo && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
                                                 {isModule && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
                                                 {isCheatsheet && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>}
                                                 {isBlog && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
                                                 {!isVideo && !isModule && !isCheatsheet && !isBlog && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[13px] font-black text-foreground flex items-center gap-1.5 truncate group-hover:text-primary transition-colors">{r.title}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-border/20 bg-muted/60 text-muted-foreground transition-all group-hover:border-primary/20 group-hover:bg-primary/5">{r.type?.toLowerCase() || r.categoryType?.toLowerCase()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                  )
                               })}
                            </div>
                        </div>
                     ))}
                  </div>
              </details>
              )}



              {related.length > 0 && (
                  <Card className="bg-background/80 backdrop-blur-2xl rounded-[1.5rem] border border-border/30 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-white/10 dark:ring-white/5 overflow-hidden">
                      <CardHeader className="p-4 border-b border-border/10 bg-muted/20">
                          <CardTitle className="text-[13px] font-black uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Related Cheatsheets</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2">
                           {related.map((r: any) => (
                              <Link key={r.id} href={`/cheatsheets/${r.slug}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border/20 hover:shadow-md group">
                                  <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1.5">
                                          <Badge variant="secondary" className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                                              {r.category}
                                          </Badge>
                                          <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">{r.title}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                                          <Clock className="h-3 w-3" /> {r.readTime} min read
                                      </div>
                                  </div>
                              </Link>
                           ))}
                      </CardContent>
                  </Card>
              )}
         </div>
      </div>
    </div>
  );
}

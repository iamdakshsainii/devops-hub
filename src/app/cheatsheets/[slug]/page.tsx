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

  const cheatsheet = await prisma.cheatsheet.findUnique({
    where: { slug },
    include: {
      author: { select: { fullName: true } },
      resources: { orderBy: { order: "asc" } },
      sections: {
        orderBy: { order: "asc" },
        include: { subsections: { orderBy: { order: "asc" } } }
      }
    }
  }).catch(() => null);

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
    where: { status: "PUBLISHED", OR: tagList.map(tag => ({ tags: { contains: tag, mode: 'insensitive' } })) },
    take: 2
  }) : [];

  const dynamicModules = tagList.length > 0 ? await prisma.roadmapStep.findMany({
    where: { OR: tagList.map(tag => ({ tags: { contains: tag, mode: 'insensitive' } })) },
    take: 2
  }) : [];

  const dynamicCheatsheets = tagList.length > 0 ? await prisma.cheatsheet.findMany({
    where: { status: "PUBLISHED", OR: tagList.map(tag => ({ tags: { contains: tag, mode: 'insensitive' } })), id: { not: cheatsheet.id } },
    take: 1
  }) : [];

  const dynamicBlogs = tagList.length > 0 ? await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", OR: tagList.map(tag => ({ tags: { contains: tag, mode: 'insensitive' } })) },
    take: 2
  }) : [];

  const allResources = [ ...(cheatsheet.resources || []), ...dynamicResources ];

  const recommendedItems = [
     ...allResources.map((r: any) => ({ id: r.id, title: r.title, description: r.description || "Access full documentation, videos, and tutorials in-app.", type: r.type || "Link", categoryType: "Resource", url: `/resources/${r.id}` })),
     ...dynamicModules.map((m: any) => ({ id: m.id, title: m.title, description: "Master this core step part of roadmap workflows securely.", type: "Module", categoryType: "Module", url: `/roadmap?stepId=${m.id}` })),
     ...dynamicCheatsheets.map((c: any) => ({ id: c.id, title: c.title, description: c.description || "Quick-reference sheet loaded with command notes layouts.", type: "Cheatsheet", categoryType: "Cheatsheet", url: `/cheatsheets/${c.slug}` })),
     ...dynamicBlogs.map((b: any) => ({ id: b.id, title: b.title, description: b.excerpt || "Read our latest blog guide loaded with dimensions.", type: "Blog", categoryType: "Blog", url: `/blog/${b.slug}` }))
  ].slice(0, 4);

  const formattedDate = new Date(cheatsheet.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <Link href="/cheatsheets" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2">
         <ArrowLeft className="h-4 w-4" /> Back to Cheatsheets
      </Link>

      <header className="space-y-4">
         <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-bold rounded-full">
                      {cheatsheet.category}
                  </Badge>
                  <span className="text-2xl">{cheatsheet.icon}</span>
             </div>
             {isAdmin && (
                <Link href={`/admin/cheatsheets/${cheatsheet.id}`} target="_blank">
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs font-semibold">
                       <Edit className="h-3.5 w-3.5" /> Edit Guide
                    </Button>
                </Link>
             )}
         </div>
         <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            {cheatsheet.title}
         </h1>
         <p className="text-base text-muted-foreground max-w-2xl">
            {cheatsheet.description}
         </p>

         <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
             <span>By {cheatsheet.author?.fullName || "Admin"}</span>
             <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
             <span>{formattedDate}</span>
             <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
             <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {cheatsheet.readTime} min</span>
             <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
             <span className="flex items-center gap-1"><BarChart className="h-3.5 w-3.5" /> {cheatsheet.difficulty}</span>
         </div>
         
         {cheatsheet.tags && (
             <div className="flex flex-wrap gap-1 mt-2">
                 {cheatsheet.tags.split(",").filter(Boolean).map((t: string) => (
                     <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/10">
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
              <Card className="bg-card/70 backdrop-blur-md rounded-2xl border border-border/40 shadow-sm sticky top-24">
                  <CardHeader className="pb-3 border-b border-border/20">
                      <CardTitle className="text-sm font-bold">Quick Info</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4 text-sm">
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Category</span>
                          <span className="font-semibold">{cheatsheet.category}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Difficulty</span>
                          <span className="font-semibold text-primary">{cheatsheet.difficulty}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Read Time</span>
                          <span className="font-semibold">{cheatsheet.readTime} mins</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Views</span>
                          <span className="font-semibold flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {cheatsheet.viewCount}</span>
                      </div>
                  </CardContent>
              </Card>

              {/* Related Resources / Recommendations */}
              {recommendedItems.length > 0 && (
              <details className="group [&_summary::-webkit-details-marker]:hidden" open>
                  <summary className="mb-3 flex cursor-pointer items-center justify-between text-sm font-black uppercase tracking-wider text-muted-foreground/80 px-2 hover:text-foreground transition-colors group">
                    <div className="flex items-center gap-2">
                      <Library className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> RECOMMENDED
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground/50 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <p className="text-[11px] text-muted-foreground/60 -mt-2 px-2 font-medium tracking-wide mb-3">Handpicked modules, videos, and guides.</p>

                  <div className="space-y-2.5 animate-in fade-in-30 slide-in-from-top-1 duration-200">
                     {recommendedItems.map((r: any) => {
                         const isVideo = r.type.toLowerCase() === "video";
                         const isModule = r.type === "Module";
                         const isCheatsheet = r.type === "Cheatsheet";
                         const isBlog = r.type === "Blog";
                         
                         return (
                          <Link key={r.id} href={r.url} className="flex flex-col gap-2 p-3.5 border border-border/10 rounded-2xl hover:bg-primary/5 hover:border-primary/20 bg-card/10 backdrop-blur-md transition-all group shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] hover:shadow-primary/5">
                              <div className="flex items-center gap-3">
                                  <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-105 shrink-0 ${isModule ? "bg-emerald-500/10 text-emerald-400" : "bg-primary/10 text-primary"}`}>
                                       {isVideo && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
                                       {isModule && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
                                       {isCheatsheet && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>}
                                       {isBlog && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
                                       {!isVideo && !isModule && !isCheatsheet && !isBlog && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
                                  </div>
                                  <div>
                                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">{r.title}</p>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md capitalize tracking-wide border border-border/5 ${isModule ? "bg-emerald-500/5 text-emerald-400" : "bg-muted/30 text-muted-foreground"}`}>{r.type.toLowerCase()}</span>
                                      </div>
                                  </div>
                              </div>
                              {r.description && (
                                  <p className="text-[10px] text-muted-foreground/80 line-clamp-2 leading-relaxed mt-1 font-medium pl-1 border-l border-border/10 ml-2">{r.description}</p>
                              )}
                          </Link>
                        )
                      })}
                  </div>
              </details>
              )}



              {related.length > 0 && (
                  <Card className="bg-card/20 backdrop-blur-xl rounded-2xl border border-border/10 shadow-sm">
                      <CardHeader className="p-4 border-b border-border/10 flex items-center gap-1.5"><CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> Related Cheatsheets</CardTitle></CardHeader>
                      <CardContent className="p-3 space-y-2">
                           {related.map((r: any) => (
                              <Link key={r.id} href={`/cheatsheets/${r.slug}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-all border border-transparent hover:border-border/10 hover:shadow-sm group">
                                  <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 rounded bg-primary/5 text-primary">
                                              {r.category}
                                          </Badge>
                                          <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{r.title}</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                                          <Clock className="h-3 w-3" /> {r.readTime} min
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

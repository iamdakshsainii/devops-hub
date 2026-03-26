import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, BarChart, Eye, LayoutGrid, Library, ChevronLeft, Edit, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CheatsheetContent } from "../cheatsheet-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cheatsheet = await prisma.cheatsheet.findUnique({ where: { slug }, select: { title: true, description: true } });
  if (!cheatsheet) return { title: "Not Found" };
  return { title: `${cheatsheet.title} | DevOps Network`, description: cheatsheet.description || "Quick cheatsheet reference guide." };
}

export default async function CheatsheetDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const session = await getServerSession(authOptions);
  const isAdmin = !!(session?.user && ["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role));

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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* ── ULTRA-PREMIUM CLEAN HEADER SECTION ── */}
      <div className="relative border-b bg-card/[0.03] dark:bg-zinc-950/20 backdrop-blur-3xl overflow-hidden pt-6 pb-8 lg:pt-8 lg:pb-10">
        <div className="container mx-auto px-6 max-w-6xl space-y-8 animate-in fade-in duration-700">
          {/* Minimal Breadcrumb */}
          <nav className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/30 mb-2 group/nav">
              <Link href="/cheatsheets" className="hover:text-foreground transition-all duration-300 flex items-center gap-2 pr-2 border-r border-border/20">
                Cheatsheets
              </Link>
              <span className="text-foreground/50 transition-colors group-hover/nav:text-foreground/80 lowercase">{cheatsheet.title}</span>
          </nav>

          <header className="flex flex-col gap-8">
             <div className="space-y-6 text-left">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-card shadow-2xl border border-border/40 text-3xl shrink-0 hover:rotate-3 transition-transform cursor-default">
                        {cheatsheet.icon}
                    </div>
                    <div className="space-y-1.5">
                        <Badge variant="secondary" className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-sm w-fit block mb-1">
                            {cheatsheet.category}
                        </Badge>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-tight text-foreground">
                            {cheatsheet.title}
                        </h1>
                    </div>
                </div>

                <p className="text-sm md:text-[15px] lg:text-[16px] text-foreground/80 dark:text-foreground/70 max-w-4xl leading-relaxed font-bold border-l-4 border-primary/40 pl-5 py-2">
                    {cheatsheet.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-4 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2 text-foreground/90">
                        <span className="opacity-30">Authored by</span> {cheatsheet.author?.fullName || "DevOps Network"}
                    </div>
                    <span className="h-1.5 w-1.5 rounded-full bg-border" />
                    <div className="text-muted-foreground/60">{formattedDate}</div>
                    <span className="h-1.5 w-1.5 rounded-full bg-border" />
                    <div className="flex items-center gap-1.5 text-muted-foreground/60"><Clock className="h-3 w-3" /> {cheatsheet.readTime}m read</div>
                    <span className="h-1.5 w-1.5 rounded-full bg-border" />
                    <div className="flex items-center gap-1.5 text-primary"><BarChart className="h-3 w-3" /> {cheatsheet.difficulty}</div>
                    
                    {tagList.length > 0 && (
                        <>
                           <span className="h-1.5 w-1.5 rounded-full bg-border" />
                           <div className="flex flex-wrap items-center gap-2">
                               {tagList.map((t: string) => (
                                   <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/40 text-muted-foreground/80 border border-border/10 hover:bg-primary/5 hover:text-primary transition-all duration-300 shadow-sm">
                                       <Tag className="h-2.5 w-2.5 opacity-40 shrink-0" />
                                       {t}
                                   </span>
                               ))}
                           </div>
                        </>
                    )}

                    {isAdmin && (
                      <Link href={`/admin/cheatsheets/${cheatsheet.id}`} target="_blank" className="ml-auto">
                          <Button variant="outline" size="sm" className="gap-2 h-7 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border-amber-500/20 shadow-sm transition-all px-3">
                             <Edit className="h-2.5 w-2.5" /> Edit mode
                          </Button>
                      </Link>
                    )}
                </div>
             </div>
          </header>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="flex flex-col lg:grid lg:grid-cols-10 gap-10">
           {/* Main Content (Full Width) */}
           <div className="lg:col-span-10">
                <CheatsheetContent sections={cheatsheet.sections} slug={slug} />
           </div>
        </div>
      </div>
    </div>
  );
}

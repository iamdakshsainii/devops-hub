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
    where: { status: "PUBLISHED", OR: tagList.map(tag => ({ tags: { contains: tag } })) },
    take: 3
  }) : [];

  const dynamicModules = tagList.length > 0 ? await prisma.roadmapStep.findMany({
    where: { OR: tagList.map(tag => ({ tags: { contains: tag } })) },
    take: 2
  }) : [];

  const dynamicCheatsheets = tagList.length > 0 ? await prisma.cheatsheet.findMany({
    where: { status: "PUBLISHED", OR: tagList.map(tag => ({ tags: { contains: tag } })), id: { not: cheatsheet.id } },
    take: 2
  }) : [];

  const relatedContent = [
     ...dynamicModules.map(m => ({ id: m.id, title: m.title, type: "Module", url: `/roadmap?stepId=${m.id}` })),
     ...dynamicCheatsheets.map((c: any) => ({ id: c.id, title: c.title, type: "Cheatsheet", url: `/cheatsheets/${c.slug}` }))
  ];

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

              {related.length > 0 && (
                  <Card className="bg-card/70 backdrop-blur-md rounded-2xl border border-border/40 shadow-sm sticky top-[18.5rem]">
                      <CardHeader className="pb-3 border-b border-border/20">
                          <CardTitle className="text-sm font-bold">Related Cheatsheets</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                          {related.map((r: any) => (
                              <Link key={r.id} href={`/cheatsheets/${r.slug}`} className="block group p-2 rounded-lg hover:bg-muted/10 transition-colors">
                                  <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 rounded">
                                          {r.category}
                                      </Badge>
                                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{r.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                      <Clock className="h-3 w-3" /> {r.readTime} min
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

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, Shield, FileText, Check, X, Bookmark, GitMerge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await prisma.tool.findUnique({ where: { slug }, select: { name: true, description: true } });
  if (!tool) return { title: "Not Found" };
  return { title: `${tool.name} | DevOps Hub`, description: tool.description || "DevOps platform platforms guide benchmarks benchmarks." };
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const tool = await prisma.tool.findUnique({ where: { slug } });
  if (!tool || tool.status === "DELETED") return notFound();

  const comparisons = await prisma.toolComparison.findMany({
     where: {
        OR: [{ toolAId: tool.id }, { toolBId: tool.id }],
        status: "PUBLISHED"
     },
     include: {
        toolA: { select: { name: true, slug: true, icon: true } },
        toolB: { select: { name: true, slug: true, icon: true } }
     }
  });

  let pros = [];
  try { pros = tool.pros && tool.pros.startsWith("[") ? JSON.parse(tool.pros) : []; } catch (e) { pros = []; }
  
  let cons = [];
  try { cons = tool.cons && tool.cons.startsWith("[") ? JSON.parse(tool.cons) : []; } catch (e) { cons = []; }
  
  let useCases = [];
  try { useCases = tool.useCases && tool.useCases.startsWith("[") ? JSON.parse(tool.useCases) : []; } catch (e) { useCases = []; }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2">
         <ArrowLeft className="h-4 w-4" /> Back to Tools Catalog
      </Link>

      <header className="space-y-4">
         <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-bold rounded-full">
                  {tool.category}
              </Badge>
         </div>
         <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-muted/30 flex items-center justify-center text-2xl shadow-inner border border-border/10">
                  {tool.icon}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  {tool.name}
              </h1>
         </div>
         <p className="text-base text-muted-foreground max-w-2xl">
            {tool.description}
         </p>

         <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
             <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-amber-500" /> {tool.difficulty}</span>
             <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
             <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-blue-500" /> {tool.license}</span>
         </div>
         
         <div className="flex flex-wrap gap-2 pt-2 border-t border-border/10 mt-2">
             {tool.docsUrl && (
                  <a href={tool.docsUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                          <FileText className="h-3.5 w-3.5" /> Official Docs
                      </Button>
                  </a>
             )}
             {tool.githubUrl && (
                  <a href={tool.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                          <Bookmark className="h-3.5 w-3.5" /> GitHub
                      </Button>
                  </a>
             )}
         </div>
      </header>

      {(tool.moduleUrl || tool.resourceUrl) && (
         <div className="bg-primary/5 p-4 rounded-xl border border-dashed border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
             <div className="space-y-1">
                 <h4 className="text-sm font-bold flex items-center gap-1.5"><GitMerge className="h-4 w-4 text-primary" /> Want to learn {tool.name} deeply?</h4>
                 <p className="text-xs text-muted-foreground">Explore our tailored modules and learning materials setup natively synced.</p>
             </div>
             <div className="flex gap-2 shrink-0">
                 {tool.moduleUrl && (
                      <Link href={tool.moduleUrl}>
                          <Button size="sm" className="h-8 text-xs gap-1"><Check className="h-3.5 w-3.5" /> Study Module</Button>
                      </Link>
                 )}
                 {tool.resourceUrl && (
                      <Link href={tool.resourceUrl}>
                          <Button variant="outline" size="sm" className="h-8 text-xs gap-1"><FileText className="h-3.5 w-3.5" /> Read Resource</Button>
                      </Link>
                 )}
             </div>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
         <Card className="bg-emerald-500/5 backdrop-blur-md rounded-xl border border-emerald-500/10 shadow-sm">
             <CardHeader className="pb-3 border-b border-emerald-500/10">
                 <CardTitle className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                     <Check className="h-4 w-4" /> Pros
                 </CardTitle>
             </CardHeader>
             <CardContent className="p-4">
                 {pros.length > 0 ? (
                     <ul className="space-y-2">
                         {pros.map((p: string, i: number) => (
                             <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                 <Check className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />
                                 <span>{p}</span>
                             </li>
                         ))}
                     </ul>
                 ) : (
                     <p className="text-xs text-muted-foreground">No pros listed.</p>
                 )}
             </CardContent>
         </Card>

         <Card className="bg-red-500/5 backdrop-blur-md rounded-xl border border-red-500/10 shadow-sm">
             <CardHeader className="pb-3 border-b border-red-500/10">
                 <CardTitle className="text-sm font-bold text-red-500 flex items-center gap-1">
                     <X className="h-4 w-4" /> Cons
                 </CardTitle>
             </CardHeader>
             <CardContent className="p-4">
                 {cons.length > 0 ? (
                     <ul className="space-y-2">
                         {cons.map((c: string, i: number) => (
                             <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                 <X className="h-3.5 w-3.5 mt-0.5 text-red-500 shrink-0" />
                                 <span>{c}</span>
                             </li>
                         ))}
                     </ul>
                 ) : (
                     <p className="text-xs text-muted-foreground">No cons listed.</p>
                 )}
             </CardContent>
         </Card>
      </div>

      {useCases.length > 0 && (
         <div className="space-y-4 mt-8">
             <h2 className="text-xl font-bold">Recommended Use cases</h2>
             <ol className="list-decimal pl-5 space-y-2">
                 {useCases.map((u: string, i: number) => (
                     <li key={i} className="text-sm text-muted-foreground pl-1">{u}</li>
                 ))}
             </ol>
         </div>
      )}

      {comparisons.length > 0 && (
          <div className="space-y-4 mt-12 border-t border-border/20 pt-8">
              <h2 className="text-xl font-bold">Related Comparisons</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {comparisons.map((c: any) => {
                      const other = c.toolAId === tool.id ? c.toolB : c.toolA;
                      return (
                          <Link key={c.id} href={`/tools/compare/${c.id}`} className="group p-4 bg-card rounded-xl border border-border/40 hover:border-primary/40 transition-all flex flex-col justify-between h-full">
                              <div className="flex items-center gap-2 mb-2">
                                  <div className="h-8 w-8 rounded-lg bg-muted/30 flex items-center justify-center text-base">
                                      {tool.icon}
                                  </div>
                                  <span className="text-xs font-bold">vs</span>
                                  <div className="h-8 w-8 rounded-lg bg-muted/30 flex items-center justify-center text-base">
                                      {other?.icon}
                                  </div>
                              </div>
                              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                                   {tool.name} vs {other?.name}
                              </p>
                              <Button variant="ghost" size="sm" className="w-full h-8 text-xs mt-3 gap-1 hover:bg-primary/5">
                                   <GitMerge className="h-3 w-3" /> View Setup
                              </Button>
                          </Link>
                      );
                  })}
              </div>
          </div>
      )}
    </div>
  );
}

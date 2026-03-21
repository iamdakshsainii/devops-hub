import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, BarChart, Eye, LayoutGrid, GitMerge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ComparisonsListingPage() {
  const comparisons = await prisma.toolComparison.findMany({
    where: { status: "PUBLISHED" },
    include: {
      toolA: { select: { name: true, slug: true, icon: true, category: true } },
      toolB: { select: { name: true, slug: true, icon: true, category: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-10">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
         <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
             <ArrowLeft className="h-4 w-4" /> Back to Tools
         </Link>
         <h1 className="text-4xl font-extrabold tracking-tight">Tool Comparisons</h1>
         <p className="text-lg text-muted-foreground">
            Side-by-side benchmarks pitting two platforms platforms together.
         </p>
      </div>

      {comparisons.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {comparisons.map((c: any) => (
               <Card key={c.id} className="group flex flex-col hover:border-primary/50 transition-all duration-300 overflow-hidden bg-card/70 backdrop-blur-sm h-full relative">
                 <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none bg-primary" />
                 
                 <CardHeader className="pb-3 text-center flex flex-col items-center">
                     <div className="flex items-center gap-3 mb-2">
                         <div className="h-14 w-14 rounded-xl bg-muted/30 flex items-center justify-center text-2xl shadow-inner border border-border/10">
                              {c.toolA?.icon}
                         </div>
                         <span className="text-sm font-bold text-muted-foreground/60">vs</span>
                         <div className="h-14 w-14 rounded-xl bg-muted/30 flex items-center justify-center text-2xl shadow-inner border border-border/10">
                              {c.toolB?.icon}
                         </div>
                     </div>
                     <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-1.5 justify-center">
                         {c.toolA?.name} <span className="text-muted-foreground text-xs">vs</span> {c.toolB?.name}
                     </CardTitle>
                     <Badge variant="secondary" className="text-[10px] items-center font-bold px-2 py-0.5 rounded-full mt-1">
                         {c.toolA?.category}
                     </Badge>
                 </CardHeader>

                 <CardContent className="pt-0 flex flex-col mt-auto border-t border-border/20 p-4 bg-muted/5">
                      <Link href={`/tools/compare/${c.id}`} className="w-full">
                          <Button variant="outline" size="sm" className="w-full h-9 text-xs font-semibold gap-1 hover:bg-primary/5">
                               <GitMerge className="h-3.5 w-3.5" /> View Comparison
                          </Button>
                      </Link>
                 </CardContent>
               </Card>
           ))}
        </div>
      ) : (
        <div className="p-16 border border-dashed rounded-xl bg-muted/10 text-center">
            <p className="text-muted-foreground">No comparisons published yet.</p>
        </div>
      )}
    </div>
  );
}

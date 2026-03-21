import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, GitMerge, PlusCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ComparisonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const comp = await prisma.toolComparison.findUnique({
    where: { id },
    include: {
       toolA: { select: { name: true, slug: true, icon: true, moduleUrl: true, resourceUrl: true } },
       toolB: { select: { name: true, slug: true, icon: true, moduleUrl: true, resourceUrl: true } }
    }
  });

  if (!comp || comp.status === "DELETED") return notFound();

  let criteria = [];
  try { criteria = comp.criteria && comp.criteria.startsWith("[") ? JSON.parse(comp.criteria) : []; } catch (e) { criteria = []; }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <Link href="/tools/compare" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
         <ArrowLeft className="h-4 w-4" /> All Comparisons
      </Link>

      <header className="flex flex-col md:flex-row items-center justify-center gap-4 py-8">
         <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border/40 shadow-sm w-full max-w-xs justify-center hover:border-primary/40 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-muted/30 flex items-center justify-center text-2xl shadow-inner border border-border/10">
                  {comp.toolA?.icon}
              </div>
              <h2 className="text-xl font-bold tracking-tight">{comp.toolA?.name}</h2>
         </div>

         <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm shadow-sm">
             VS
         </div>

         <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border/40 shadow-sm w-full max-w-xs justify-center hover:border-primary/40 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-muted/30 flex items-center justify-center text-2xl shadow-inner border border-border/10">
                  {comp.toolB?.icon}
              </div>
              <h2 className="text-xl font-bold tracking-tight">{comp.toolB?.name}</h2>
         </div>
      </header>

      {(comp.toolA?.moduleUrl || comp.toolA?.resourceUrl || comp.toolB?.moduleUrl || comp.toolB?.resourceUrl) && (
         <div className="bg-primary/5 p-4 rounded-xl border border-dashed border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="space-y-1">
                 <h4 className="text-sm font-bold flex items-center gap-1.5"><PlusCircle className="h-4 w-4 text-primary" /> Learn these deeply?</h4>
                 <p className="text-xs text-muted-foreground">Explore modules and materials tailored setups attached below.</p>
             </div>
             <div className="flex gap-1.5 shrink-0 flex-wrap">
                 {comp.toolA?.moduleUrl && (
                      <Link href={comp.toolA.moduleUrl}>
                          <Button size="sm" className="h-7 text-[10px] gap-1"><PlusCircle className="h-3 w-3" /> Study {comp.toolA.name}</Button>
                      </Link>
                 )}
                 {comp.toolB?.moduleUrl && (
                      <Link href={comp.toolB.moduleUrl}>
                          <Button size="sm" className="h-7 text-[10px] gap-1"><PlusCircle className="h-3 w-3" /> Study {comp.toolB.name}</Button>
                      </Link>
                 )}
             </div>
         </div>
      )}

      <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden">
         <div className="grid grid-cols-2 text-center text-sm font-bold bg-muted/10 border-b border-border/20 p-4">
              <div className="text-foreground border-r border-border/10">{comp.toolA?.name}</div>
              <div className="text-foreground">{comp.toolB?.name}</div>
         </div>

         <div className="divide-y divide-border/20">
             {criteria.length > 0 ? (
                 criteria.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-2 p-4 flex flex-col items-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider bg-muted/30 px-2 py-0.5 rounded">
                            {item.label}
                        </span>
                        <div className="grid grid-cols-2 w-full text-center gap-4 text-sm font-semibold text-foreground/90">
                            <div className="border-r border-border/10 px-2 flex justify-center items-center h-full min-h-[2.5rem]">{item.toolAValue}</div>
                            <div className="px-2 flex justify-center items-center h-full min-h-[2.5rem]">{item.toolBValue}</div>
                        </div>
                    </div>
                 ))
             ) : (
                 <div className="p-8 text-center text-muted-foreground text-sm">
                     No criteria benchmarks listed.
                 </div>
             )}
         </div>
      </div>

      {comp.summary && (
          <div className="space-y-4 mt-8 bg-card/40 backdrop-blur-md p-6 rounded-2xl border border-border/30 shadow-sm">
              <h3 className="text-lg font-bold flex items-center gap-1.5"><GitMerge className="h-5 w-5 text-primary" /> Verdict / Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                   {comp.summary}
              </p>
          </div>
      )}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Library, ExternalLink, Edit, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminModulesPage() {
  // Directly fetch Steps with nested content to handle them standalone!
  const modules = await prisma.roadmapStep.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      roadmap: { select: { title: true, color: true } },
      _count: { select: { topics: true, resources: true } }
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modules Manager</h1>
          <p className="text-muted-foreground mt-1">Manage individual teaching nodes, standalone topics & knowledge items.</p>
        </div>
        <Link href="/admin/modules/new">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" /> New Module
          </Button>
        </Link>
      </div>

      {modules.length > 0 ? (
        <div className="grid gap-4">
          {modules.map((mod) => (
            <Card key={mod.id} className="overflow-hidden">
               <div className="h-1" style={{ backgroundColor: mod.roadmap?.color || "#3B82F6" }} />
               <CardHeader className="p-5 pb-3">
                 <div className="flex items-start justify-between gap-4">
                   <div className="flex items-center gap-3">
                     <span className="text-2xl">{mod.icon}</span>
                     <div>
                       <CardTitle className="text-lg">{mod.title}</CardTitle>
                       <CardDescription className="line-clamp-1 mt-1">{mod.description || "Standalone Module Node"}</CardDescription>
                     </div>
                   </div>
                   <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
                       {mod.roadmap?.title || "Standalone"}
                   </span>
                 </div>
               </CardHeader>
               <CardContent className="p-5 pt-0">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{mod._count.topics} Topics</span>
                        <span>{mod._count.resources} Resources</span>
                     </div>
                     <div className="flex gap-2">
                        <Link href={`/admin/modules/${mod.id}`}>
                           <Button variant="secondary" size="sm" className="h-8 text-xs"><Edit className="h-3 w-3 mr-1" /> Edit</Button>
                        </Link>
                     </div>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-dashed rounded-xl p-16 text-center bg-muted/10">
          <Library className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No standalone modules yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">Create modular templates that can live natively on independent filters.</p>
          <Link href="/admin/modules/new">
             <Button><PlusCircle className="h-4 w-4 mr-2" /> Create First Module</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

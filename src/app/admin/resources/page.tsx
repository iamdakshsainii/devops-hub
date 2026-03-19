import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, PlusCircle, Trash2, Edit } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { fullName: true } } }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resources Direct Manager</h1>
          <p className="text-muted-foreground mt-1">Direct master panel managing global community submitted or admin reference links.</p>
        </div>
        <Link href="/admin/resources/new">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" /> New Resource
          </Button>
        </Link>
      </div>

      {resources.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => (
            <Card key={res.id} className="flex flex-col">
               <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between">
                     <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {res.type}
                     </span>
                  </div>
                  <CardTitle className="text-lg mt-2 line-clamp-1">{res.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs h-8">{res.description}</CardDescription>
               </CardHeader>
               <CardContent className="p-5 pt-0 mt-auto space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                     <span>By {res.author.fullName || "Admin"}</span>
                  </div>
                  <div className="flex gap-2 w-full">
                     <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full h-8 text-xs"><ExternalLink className="h-3 w-3 mr-1" /> Visit</Button>
                     </a>
                     <Link href={`/admin/resources/${res.id}`} className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full h-8 text-xs"><Edit className="h-3 w-3 mr-1" /> Edit</Button>
                     </Link>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-dashed rounded-xl p-16 text-center bg-muted/10">
          <p className="text-muted-foreground">No resources in index yet.</p>
        </div>
      )}
    </div>
  );
}

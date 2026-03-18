import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminApprovalActions } from "@/components/admin-approval-actions";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const pendingResources = await prisma.resource.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { fullName: true, email: true } } }
  });

  const publishedResources = await prisma.resource.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { author: { select: { fullName: true } } }
  });

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resources Moderation Queue</h1>
          <p className="text-muted-foreground mt-1">Review resources submitted by the community.</p>
        </div>

        {pendingResources.length > 0 ? (
          <div className="space-y-4">
            {pendingResources.map(resource => (
              <Card key={resource.id}>
                <CardHeader className="p-5 pb-3 bg-muted/20 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded mr-2">
                        {resource.type}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded mr-2">
                        {resource.tags}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded">
                        Pending
                      </span>
                    </div>
                    <AdminApprovalActions itemId={resource.id} itemType="RESOURCE" initialStatus={resource.status} />
                  </div>
                  <CardTitle className="text-xl mt-3">{resource.title}</CardTitle>
                  <CardDescription>Submitted by {resource.author.fullName} ({resource.author.email})</CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <p className="text-sm text-foreground/90 mb-4">{resource.description}</p>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="h-8">Verify Link <ExternalLink className="ml-1.5 h-3 w-3" /></Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="border border-dashed rounded-xl p-12 text-center bg-muted/10">
             <p className="text-muted-foreground">The resource queue is empty. Great job!</p>
          </div>
        )}
      </section>

      <section className="space-y-6 pt-8 border-t">
        <h2 className="text-xl font-bold tracking-tight">Recently Published</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {publishedResources.map(resource => (
             <Card key={resource.id} className="opacity-80">
               <CardHeader className="p-4 pb-2">
                 <CardTitle className="text-base line-clamp-1 flex items-center gap-2">
                   <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 rounded h-5 flex items-center">
                     {resource.type}
                   </span>
                   {resource.title}
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-4 pt-0 flex justify-between items-end">
                 <p className="text-xs text-muted-foreground">By {resource.author.fullName}</p>
                 <AdminApprovalActions itemId={resource.id} itemType="RESOURCE" initialStatus={resource.status} />
               </CardContent>
             </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

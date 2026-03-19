import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Map, PlusCircle, FileText, BookOpen, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminRoadmapsPage() {
  const roadmaps = await prisma.roadmap.findMany({
    orderBy: { order: "asc" },
    include: {
      steps: {
        select: {
          id: true,
          title: true,
          _count: { select: { topics: true, resources: true } }
        }
      }
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roadmaps Manager</h1>
          <p className="text-muted-foreground mt-1">Create and manage learning roadmaps for the community.</p>
        </div>
        <Link href="/admin/roadmaps/new">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" /> New Roadmap
          </Button>
        </Link>
      </div>

      {roadmaps.length > 0 ? (
        <div className="grid gap-4">
          {roadmaps.map((roadmap) => {
            const totalTopics = roadmap.steps.reduce((s, st) => s + st._count.topics, 0);
            const totalResources = roadmap.steps.reduce((s, st) => s + st._count.resources, 0);

            return (
              <Card key={roadmap.id} className="overflow-hidden">
                <div className="h-1" style={{ backgroundColor: roadmap.color }} />
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{roadmap.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{roadmap.title}</CardTitle>
                        <CardDescription className="line-clamp-1 mt-1">{roadmap.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        roadmap.status === "PUBLISHED" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                      }`}>
                        {roadmap.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Map className="h-3.5 w-3.5" /> {roadmap.steps.length} Steps</span>
                      <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {totalTopics} Topics</span>
                      <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {totalResources} Resources</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/roadmap/${roadmap.id}`} target="_blank">
                        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                          Preview <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Link href={`/admin/roadmaps/${roadmap.id}`}>
                        <Button variant="secondary" size="sm" className="h-8 text-xs">Edit</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed rounded-xl p-16 text-center bg-muted/10">
          <Map className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No roadmaps created yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Create your first learning roadmap with steps, topics, and resources.
          </p>
          <Link href="/admin/roadmaps/new">
            <Button className="gap-2"><PlusCircle className="h-4 w-4" /> Create First Roadmap</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

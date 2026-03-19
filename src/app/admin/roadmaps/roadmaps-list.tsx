"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Map, PlusCircle, FileText, BookOpen, ExternalLink, Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminRoadmapsList({ roadmaps }: { roadmaps: any[] }) {
  const [localRoadmaps, setLocalRoadmaps] = useState(roadmaps);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    setLoadingId(id);
    const newStatus = currentStatus === "PUBLISHED" ? "PENDING" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/roadmaps/${id}`, { // Wait, do we have an API for Roadmap PUT? I should check!
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setLocalRoadmaps(localRoadmaps.map(r => r.id === id ? { ...r, status: newStatus } : r));
      } else { alert("Failed to toggle status"); }
    } catch (err) { console.error(err); }
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this roadmap? All nested steps and modules inside will be affected!")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/roadmaps/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLocalRoadmaps(localRoadmaps.filter(r => r.id !== id));
      } else { alert("Delete failed. Subcomponents could be locking removal"); }
    } catch (err) { console.error(err); }
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
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

      {localRoadmaps.length > 0 ? (
        <div className="grid gap-4">
          {localRoadmaps.map((roadmap) => {
            const totalTopics = roadmap.steps.reduce((s:any, st:any) => s + (st._count?.topics || 0), 0);
            const totalResources = roadmap.steps.reduce((s:any, st:any) => s + (st._count?.resources || 0), 0);

            return (
              <Card key={roadmap.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                <div className="h-1" style={{ backgroundColor: roadmap.color }} />
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{roadmap.icon}</span>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {roadmap.title}
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                               roadmap.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                            }`}>
                               {roadmap.status === "PUBLISHED" ? "LIVE" : "DRAFT"}
                            </span>
                        </CardTitle>
                        <CardDescription className="line-clamp-1 mt-1 text-xs">{roadmap.description}</CardDescription>
                      </div>
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
                    <div className="flex gap-1.5 border-l pl-4 border-muted/50">
                        <Button 
                           variant="outline" 
                           size="sm" 
                           onClick={() => handleToggleStatus(roadmap.id, roadmap.status)} 
                           disabled={loadingId === roadmap.id}
                           className="h-8 text-xs font-medium"
                        >
                           {loadingId === roadmap.id ? <Loader2 className="h-3 w-3 animate-spin"/> : roadmap.status === "PUBLISHED" ? <><EyeOff className="h-3 w-3 mr-1"/> Delist</> : <><Eye className="h-3 w-3 mr-1"/> Publish</>}
                        </Button>

                        <Link href={`/roadmap/${roadmap.id}`} target="_blank">
                           <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                              Preview <ExternalLink className="h-3 w-3" />
                           </Button>
                        </Link>

                        <Link href={`/admin/roadmaps/${roadmap.id}`}>
                           <Button variant="secondary" size="sm" className="h-8 text-xs"><Edit className="h-3 w-3 mr-1" /> Edit</Button>
                        </Link>

                        <Button 
                           variant="outline" 
                           size="sm" 
                           onClick={() => handleDelete(roadmap.id)} 
                           disabled={loadingId === roadmap.id}
                           className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/20 font-medium"
                        >
                           <Trash2 className="h-3 w-3" />
                        </Button>
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
          <p className="text-muted-foreground max-w-md mx-auto mb-6">Create your first learning roadmap with steps and topics.</p>
        </div>
      )}
    </div>
  );
}

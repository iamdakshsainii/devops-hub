"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { PlusCircle, Edit, Search, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminModulesList({ modules }: { modules: any[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [localModules, setLocalModules] = useState(modules);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredModules = localModules.filter((mod) => {
    const matchesSearch = mod.title.toLowerCase().includes(search.toLowerCase()) || 
                         (mod.description && mod.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || mod.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    setLoadingId(id);
    const newStatus = currentStatus === "PUBLISHED" ? "PENDING" : "PUBLISHED";
    try {
      const res = await fetch(`/api/modules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setLocalModules(localModules.map(m => m.id === id ? { ...m, status: newStatus } : m));
      }
    } catch (err) { console.error(err); }
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this module? This action is permanent!")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/modules/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLocalModules(localModules.filter(m => m.id !== id));
      }
    } catch (err) { console.error(err); }
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 border rounded-md bg-background text-sm flex-1 sm:flex-none"
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="PENDING">Drafts</option>
          </select>
          <Link href="/admin/modules/new" className="flex-1 sm:flex-none">
            <Button size="sm" className="gap-2 h-9 w-full">
              <PlusCircle className="h-4 w-4" /> New Module
            </Button>
          </Link>
        </div>
      </div>

      {filteredModules.length > 0 ? (
        <div className="grid gap-4">
          {filteredModules.map((mod) => (
            <Card key={mod.id} className="overflow-hidden hover:border-primary/50 transition-colors">
               <div className="h-1" style={{ backgroundColor: mod.roadmap?.color || "#3B82F6" }} />
               <CardHeader className="p-5 pb-3">
                 <div className="flex items-start justify-between gap-4">
                   <div className="flex items-center gap-3">
                     <span className="text-2xl">{mod.icon}</span>
                     <div>
                       <CardTitle className="text-lg flex items-center gap-2">
                         {mod.title}
                         <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                           mod.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                         }`}>
                           {mod.status === "PUBLISHED" ? "LIVE" : "DRAFT"}
                         </span>
                       </CardTitle>
                       <CardDescription className="line-clamp-1 mt-1 text-xs">{mod.description || "Standalone Module Node"}</CardDescription>
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
                     <div className="flex gap-1.5">
                        <Button 
                           variant="outline" 
                           size="sm" 
                           onClick={() => handleToggleStatus(mod.id, mod.status)} 
                           disabled={loadingId === mod.id}
                           className="h-8 text-xs font-medium"
                        >
                           {loadingId === mod.id ? <Loader2 className="h-3 w-3 animate-spin"/> : mod.status === "PUBLISHED" ? <><EyeOff className="h-3 w-3 mr-1"/> Delist</> : <><Eye className="h-3 w-3 mr-1"/> Publish</>}
                        </Button>

                        <Link href={`/admin/modules/${mod.id}`}>
                           <Button variant="secondary" size="sm" className="h-8 text-xs font-medium"><Edit className="h-3 w-3 mr-1" /> Edit</Button>
                        </Link>

                        <Button 
                           variant="outline" 
                           size="sm" 
                           onClick={() => handleDelete(mod.id)} 
                           disabled={loadingId === mod.id}
                           className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/20 font-medium"
                        >
                           <Trash2 className="h-3 w-3" />
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-dashed rounded-xl p-16 text-center bg-muted/10">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No modules found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">Try resetting or modifying your search filters.</p>
        </div>
      )}
    </div>
  );
}

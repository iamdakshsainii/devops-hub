"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { PlusCircle, Edit, Search, Trash2, Eye, EyeOff, Loader2, X, RefreshCw } from "lucide-react";
import { StepViewer } from "@/components/step-viewer";

export default function AdminModulesList({ modules, roadmaps = [] }: { modules: any[], roadmaps?: any[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roadmapFilter, setRoadmapFilter] = useState<string>("ALL");
  const [localModules, setLocalModules] = useState(modules);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("DEFAULT");

  const [previewStep, setPreviewStep] = useState<any>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

  const handlePreview = async (id: string) => {
      setPreviewLoadingId(id);
      try {
          const res = await fetch(`/api/modules/${id}`);
          if (res.ok) {
              const data = await res.json();
              setPreviewStep(data);
          }
      } catch (err) { console.error(err); }
      setPreviewLoadingId(null);
  };


  const handleAssignRoadmap = async (id: string, roadmapId: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/modules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roadmapId })
      });
      if (res.ok) {
        setLocalModules(localModules.map(m => m.id === id ? { 
          ...m, 
          roadmapId: roadmapId === "STANDALONE" ? null : roadmapId,
          roadmap: roadmapId === "STANDALONE" ? null : { title: roadmaps.find(r => r.id === roadmapId)?.title }
        } : m));
      }
    } catch (err) { console.error(err); }
    setLoadingId(null);
  };

  const handleUpdateOrder = async (id: string, orderStr: string) => {
    if (!orderStr) return;
    const orderNum = parseInt(orderStr) - 1; // 1-indexed for users
    if (isNaN(orderNum) || orderNum < 0) return;

    setLoadingId(id);
    try {
      const res = await fetch(`/api/modules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: orderNum })
      });
      if (res.ok) {
        setLocalModules(localModules.map(m => m.id === id ? { ...m, order: orderNum } : m));
      }
    } catch (err) { console.error(err); }
    setLoadingId(null);
  };

  const roadmapTitles = Array.from(new Set(modules.map(m => m.roadmap?.title || "Standalone")));

  const filteredModules = localModules.filter((mod) => {
    const matchesSearch = mod.title.toLowerCase().includes(search.toLowerCase()) || 
                         (mod.description && mod.description.toLowerCase().includes(search.toLowerCase()));
    
    // Default "ALL" hides DELETED items so they act like a Recycle Bin
    const matchesStatus = statusFilter === "ALL" 
      ? mod.status !== "DELETED" 
      : mod.status === statusFilter;
      
    const matchesRoadmap = roadmapFilter === "ALL" || (mod.roadmap?.title || "Standalone") === roadmapFilter;
    return matchesSearch && matchesStatus && matchesRoadmap;
  });

  const sortedModules = [...filteredModules].sort((a, b) => {
    if (sortBy === "STEPS") {
      const titleA = a.roadmap?.title || "Standalone";
      const titleB = b.roadmap?.title || "Standalone";
      if (titleA !== titleB) return titleA.localeCompare(titleB);
      // Fallback fallback order numbers
      return (a.order || 0) - (b.order || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleBulkDelete = async () => {
     if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected modules?`)) return;
     setLoadingId("BULK");
     try {
       await Promise.all(selectedIds.map(id => fetch(`/api/modules/${id}`, { method: "DELETE" })));
       setLocalModules(localModules.filter(m => !selectedIds.includes(m.id)));
       setSelectedIds([]);
     } catch (err) { console.error(err); }
     setLoadingId(null);
  };

  const handleBulkStatus = async (newStatus: string) => {
     setLoadingId("BULK");
     try {
       await Promise.all(selectedIds.map(id => fetch(`/api/modules/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
       })));
       setLocalModules(localModules.map(m => selectedIds.includes(m.id) ? { ...m, status: newStatus } : m));
       setSelectedIds([]);
     } catch (err) { console.error(err); }
     setLoadingId(null);
  };

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
            value={roadmapFilter} 
            onChange={(e) => setRoadmapFilter(e.target.value)}
            className="h-9 px-3 border rounded-md bg-background text-sm flex-1 sm:flex-none"
          >
            <option value="ALL">All Roadmaps</option>
            <option value="Standalone">Standalone Only</option>
            {roadmapTitles.filter((t: any) => t !== "Standalone").map((title: any) => (
               <option key={title} value={title}>{title}</option>
            ))}
          </select>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 border rounded-md bg-background text-sm flex-1 sm:flex-none"
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="PENDING">Drafts</option>
            <option value="DELETED">Recycle Bin</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 border rounded-md bg-background text-sm flex-1 sm:flex-none"
          >
            <option value="DEFAULT">Sort: Latest</option>
            <option value="STEPS">Sort: Steps Order</option>
          </select>

          <Link href="/admin/modules/new" className="flex-1 sm:flex-none">
            <Button size="sm" className="gap-2 h-9 w-full">
              <PlusCircle className="h-4 w-4" /> New Module
            </Button>
          </Link>
        </div>
      </div>
      
      {selectedIds.length > 0 && (
         <div className="bg-muted p-3 px-4 rounded-xl flex items-center justify-between border shadow-sm backdrop-blur-md">
             <div className="flex items-center gap-2 text-sm font-semibold">
                 <input type="checkbox" checked={selectedIds.length === sortedModules.length} onChange={() => { if (selectedIds.length === sortedModules.length) setSelectedIds([]); else setSelectedIds(sortedModules.map(m => m.id)) }} className="rounded" />
                <span>{selectedIds.length} modules selected</span>
             </div>
             <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleBulkStatus("PUBLISHED")} disabled={loadingId === "BULK"}><Eye className="h-3 w-3 mr-1" /> Publish All</Button>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleBulkStatus("PENDING")} disabled={loadingId === "BULK"}><EyeOff className="h-3 w-3 mr-1" /> Delist All</Button>
                <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={handleBulkDelete} disabled={loadingId === "BULK"}>Delete All ({selectedIds.length})</Button>
             </div>
         </div>
      )}

       {sortedModules.length > 0 ? (
        <div className="grid gap-4">
          {sortedModules.map((mod) => (
            <div key={mod.id} className="flex gap-3 items-start">
               <div className="pt-6">
                 <input type="checkbox" checked={selectedIds.includes(mod.id)} onChange={() => { if (selectedIds.includes(mod.id)) setSelectedIds(selectedIds.filter(id => id !== mod.id)); else setSelectedIds([...selectedIds, mod.id]) }} className="rounded custom-checkbox cursor-pointer" />
               </div>
               <Card className="overflow-hidden hover:border-primary/50 transition-colors flex-1">
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
                     <div className="flex flex-col items-end gap-1.5">
                        <select 
                           value={mod.roadmapId || "STANDALONE"} 
                           onChange={(e) => handleAssignRoadmap(mod.id, e.target.value)}
                           disabled={loadingId === mod.id}
                           className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-muted text-muted-foreground border-none cursor-pointer focus:ring-1 max-w-[150px] truncate"
                        >
                           <option value="STANDALONE">Standalone</option>
                           {roadmaps.map((r: any) => (
                              <option key={r.id} value={r.id}>{r.title}</option>
                           ))}
                        </select>
                        {(mod.roadmapId && mod.roadmapId !== "STANDALONE") && (
                           <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <span>Step #</span>
                              <input 
                                 type="number" 
                                 min="1"
                                 defaultValue={mod.order !== undefined ? mod.order + 1 : ""} 
                                 onBlur={(e) => handleUpdateOrder(mod.id, e.target.value)}
                                 className="w-10 px-1 py-0.5 rounded border bg-transparent text-center focus:outline-none text-[10px]"
                              />
                           </div>
                        )}
                     </div>
                  </div>
                </CardHeader>
               <CardContent className="p-5 pt-0">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{mod._count.topics} Topics</span>
                        <span>{mod._count.resources} Resources</span>
                     </div>
                     <div className="flex gap-1.5">
                        {mod.status === "DELETED" ? (
                           <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleToggleStatus(mod.id, "DELETED")} 
                              disabled={loadingId === mod.id}
                              className="h-8 text-xs font-medium border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                           >
                              {loadingId === mod.id ? <Loader2 className="h-3 w-3 animate-spin"/> : "Restore"}
                           </Button>
                        ) : (
                           <>
                              <Button 
                                 variant="outline" 
                                 size="sm" 
                                 onClick={() => handleToggleStatus(mod.id, mod.status)} 
                                 disabled={loadingId === mod.id}
                                 className="h-8 text-xs font-medium"
                              >
                                 {loadingId === mod.id ? <Loader2 className="h-3 w-3 animate-spin"/> : mod.status === "PUBLISHED" ? <><EyeOff className="h-3 w-3 mr-1"/> Delist</> : <><Eye className="h-3 w-3 mr-1"/> Publish</>}
                              </Button>

                              <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  onClick={() => handlePreview(mod.id)} 
                                  disabled={previewLoadingId === mod.id}
                                  className="h-8 text-xs font-medium"
                               >
                                  {previewLoadingId === mod.id ? <Loader2 className="h-3 w-3 animate-spin"/> : <><Eye className="h-3 w-3 mr-1"/> Preview</>}
                               </Button>

                               <Link href={`/admin/modules/${mod.id}`}>
                                  <Button variant="outline" size="sm" className="h-8 text-xs font-medium"><Edit className="h-3 w-3 mr-1" /> Edit</Button>
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
                           </>
                        )}
                     </div>
                  </div>
               </CardContent>
            </Card>
           </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed rounded-xl p-16 text-center bg-muted/10">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No modules found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">Try resetting or modifying your search filters.</p>
        </div>
      )}

      {previewStep && (

         <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
             <div className="absolute top-3 right-4 z-[60] flex items-center gap-2">
                 <Button variant="outline" size="sm" className="text-xs font-bold gap-1 bg-background/80 backdrop-blur-md border border-border/20 shadow-md" onClick={() => handlePreview(previewStep.id)} disabled={previewLoadingId === previewStep.id}>
                     {previewLoadingId === previewStep.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Refresh
                 </Button>
                 <Button variant="outline" size="sm" className="text-xs font-bold gap-1 bg-background/80 backdrop-blur-md border border-border/20 shadow-md" onClick={() => setPreviewStep(null)}>
                     <X className="h-3.5 w-3.5" /> Close Preview
                 </Button>
             </div>
             <div className="h-full w-full overflow-auto">
                 <StepViewer step={previewStep} roadmap={previewStep.roadmap || { color: "#3B82F6" }} isStandalone={true} />
             </div>
         </div>
      )}

    </div>
  );
}


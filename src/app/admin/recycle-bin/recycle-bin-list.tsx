"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCcw, Archive, Loader2 } from "lucide-react";

export default function RecycleBinList({ initialModules, initialResources }: { initialModules: any[], initialResources: any[] }) {
  const [modules, setModules] = useState(initialModules);
  const [resources, setResources] = useState(initialResources);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const totalItems = modules.length + resources.length;

  const handleAction = async (id: string, type: string, action: "restore" | "purge") => {
    setLoadingId(id);
    try {
      if (action === "purge" && !confirm("Permanently delete this item from the database? This cannot be undone!")) {
         setLoadingId(null);
         return;
      }

      const res = await fetch(`/api/admin/recycle-bin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, action })
      });

      if (res.ok) {
         if (type === "MODULE") setModules(modules.filter(m => m.id !== id));
         else setResources(resources.filter(r => r.id !== id));
      } else { alert("Operation failed"); }
    } catch (err) { console.error(err); }
    setLoadingId(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recycle Bin</h1>
        <p className="text-muted-foreground mt-1">Recover items deleted in the last 7 days or permanently purge them.</p>
      </div>

      {totalItems === 0 ? (
        <div className="border border-dashed rounded-xl p-16 text-center bg-muted/10">
          <Archive className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Recycle Bin is empty</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">Deleted items will appear here for 7 days before permanent removal.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {modules.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-500"/> Modules ({modules.length})</h2>
              <div className="grid gap-3">
                {modules.map((m) => (
                  <DeletedCard key={m.id} item={m} type="MODULE" loading={loadingId === m.id} onAction={handleAction}/>
                ))}
              </div>
            </div>
          )}

          {resources.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500"/> Resources ({resources.length})</h2>
              <div className="grid gap-3">
                {resources.map((r) => (
                  <DeletedCard key={r.id} item={r} type="RESOURCE" loading={loadingId === r.id} onAction={handleAction}/>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DeletedCard({ item, type, loading, onAction }: { item: any; type: string; loading: boolean; onAction: any }) {
  return (
    <Card className="flex items-center justify-between p-4 bg-muted/5 hover:bg-muted/10 transition-colors">
      <div>
         <h4 className="font-medium text-sm">{item.title}</h4>
         <p className="text-xs text-muted-foreground mt-1">
             Type: <span className="uppercase font-semibold text-primary/80">{type}</span> 
             {item.roadmap && ` | Roadmap: ${item.roadmap.title}`}
         </p>
      </div>
      <div className="flex gap-1.5 border-l pl-4 border-muted-foreground/20">
         <Button 
            variant="outline" 
            size="sm" 
            disabled={loading}
            onClick={() => onAction(item.id, type, "restore")}
            className="h-8 gap-1 border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-600 font-medium"
         >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <RefreshCcw className="h-3.5 w-3.5" />} Restore
         </Button>
         <Button 
            variant="outline" 
            size="sm" 
            disabled={loading}
            onClick={() => onAction(item.id, type, "purge")}
            className="h-8 w-8 p-0 border-destructive/20 hover:bg-destructive/10 text-destructive"
         >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Trash2 className="h-3.5 w-3.5" />}
         </Button>
      </div>
    </Card>
  );
}

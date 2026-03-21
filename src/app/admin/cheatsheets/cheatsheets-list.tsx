"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { 
  PlusCircle, Edit, Search, Trash2, 
  Eye, EyeOff, Loader2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CheatsheetsList({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState("");
  const [localData, setLocalData] = useState(initialData);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    setLoadingId(id);
    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/cheatsheets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLocalData(localData.map((c) => c.id === id ? { ...c, status: newStatus } : c));
      }
    } catch (err) { console.error(err); }
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to soft delete this cheatsheet?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/cheatsheets/${id}`, { method: "DELETE" });
      if (res.ok) {
          setLocalData(localData.filter((c) => c.id !== id));
      }
    } catch { alert("Failed to delete cheatsheet"); }
    setLoadingId(null);
  };

  const filtered = localData.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-center">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cheatsheets..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link href="/admin/cheatsheets/new">
          <Button size="sm" className="gap-2 h-9">
            <PlusCircle className="h-4 w-4" /> New Cheatsheet
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm">
        <div className="hidden md:grid grid-cols-7 gap-4 p-4 font-bold text-xs text-muted-foreground border-b border-border/30 bg-muted/10">
          <div className="col-span-2">Title</div>
          <div>Category</div>
          <div>Difficulty</div>
          <div>Sections</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 border-b border-border/10 items-center text-sm last:border-0 hover:bg-muted/5 transition-colors">
              <div className="col-span-2 font-semibold">
                {item.title}
                <div className="md:hidden text-xs text-muted-foreground mt-1">Category: {item.category}</div>
              </div>
              <div className="hidden md:block">
                <Badge variant="secondary" className="font-semibold text-xs">
                  {item.category}
                </Badge>
              </div>
              <div className="hidden md:block">
                 <span className={`text-xs font-bold ${
                   item.difficulty === "ADVANCED" ? "text-red-500" :
                   item.difficulty === "INTERMEDIATE" ? "text-amber-500" : "text-emerald-500"
                 }`}>
                   {item.difficulty}
                 </span>
              </div>
              <div className="hidden md:block">
                {item._count.sections} refs
              </div>
              <div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                  item.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                }`}>
                   {item.status}
                </span>
              </div>
              <div className="flex gap-2 justify-end">
                <Link href={`/admin/cheatsheets/${item.id}`}>
                  <Button variant="secondary" size="sm" className="h-8 text-xs font-medium">
                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loadingId === item.id}
                  onClick={() => handleToggleStatus(item.id, item.status)}
                  className="h-8 text-xs px-2"
                  title={item.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                >
                  {loadingId === item.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : item.status === "PUBLISHED" ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  disabled={loadingId === item.id}
                  className="h-8 px-2 text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-muted-foreground">
             No cheatsheets found. Create one above.
          </div>
        )}
      </div>
    </div>
  );
}

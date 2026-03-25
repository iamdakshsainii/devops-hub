"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { PlusCircle, Edit, Search, Trash2, Eye, EyeOff, Loader2, Heart, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BlogList({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState("");
  const [localData, setLocalData] = useState(initialData);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    setLoadingId(id);
    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLocalData(localData.map((p) => p.id === id ? { ...p, status: newStatus } : p));
      }
    } catch (err) { console.error(err); }
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to soft delete this blog post?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (res.ok) {
          setLocalData(localData.filter((p) => p.id !== id));
      }
    } catch { alert("Failed to delete post"); }
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
            placeholder="Search blog posts..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link href="/admin/blog/new">
          <Button size="sm" className="gap-2 h-9">
            <PlusCircle className="h-4 w-4" /> New Blog Post
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm">
        <div className="hidden md:grid grid-cols-9 gap-4 p-4 font-bold text-xs text-muted-foreground border-b border-border/30 bg-muted/10">
          <div className="col-span-2">Title</div>
          <div>Category</div>
          <div>Status</div>
          <div>Views</div>
          <div>Likes</div>
          <div>Comments</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-9 gap-4 p-4 border-b border-border/10 items-center text-sm last:border-0 hover:bg-muted/5 transition-colors">
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
                <div className="flex flex-col gap-1 items-start">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                    item.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                  }`}>
                     {item.status}
                  </span>
                  {item.isPinned && (
                    <Badge variant="outline" className="text-[9px] h-4 py-0 px-1 border-amber-500/30 text-amber-600 bg-amber-400/5">PINNED</Badge>
                  )}
                </div>
              </div>
              <div className="hidden md:block text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {item.viewCount}</span>
              </div>
              <div className="hidden md:block text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-red-500/80" /> {item.likeCount}</span>
              </div>
              <div className="hidden md:block text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5 text-blue-500/80" /> {item._count.comments}</span>
              </div>
              <div className="col-span-2 flex gap-1 justify-end items-center">

                <a href={`/blog/${item.slug}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground">
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Button>
                </a>
                <Link href={`/admin/blog/${item.id}`}>
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
             No blog posts found. Create one above.
          </div>
        )}
      </div>
    </div>
  );
}

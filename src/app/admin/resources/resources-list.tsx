"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  PlusCircle, Edit, Search, ExternalLink, Trash2,
  Eye, EyeOff, Loader2, FileText, Video, List,
  FileType2, BookOpen, LayoutGrid, Wrench,
  Book, FileCode, PenTool, GraduationCap, Mic, Twitter
} from "lucide-react";

// Must match values stored in DB (from module editor + admin resource form)
const TYPE_FILTERS = [
  { label: "All Types", value: "ALL", icon: LayoutGrid },
  { label: "Documentation", value: "DOCUMENTATION", icon: Book },
  { label: "Video", value: "VIDEO", icon: Video },
  { label: "Playlist", value: "PLAYLIST", icon: List },
  { label: "Notes", value: "NOTES", icon: BookOpen },
];

const TYPE_ICON_MAP: Record<string, React.ElementType> = {
  DOCUMENTATION: Book,
  VIDEO: Video,
  PLAYLIST: List,
  NOTES: BookOpen,
};

export default function AdminResourcesList({ resources }: { resources: any[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [localResources, setLocalResources] = useState(resources);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    setLoadingId(id);
    const newStatus = currentStatus === "PUBLISHED" ? "PENDING" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok)
        setLocalResources(localResources.map((r) => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) { console.error(err); }
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/resources/${id}`, { method: "DELETE" });
      if (res.ok) setLocalResources(localResources.filter((r) => r.id !== id));
    } catch { alert("Failed to delete resource"); }
    setLoadingId(null);
  };

  const filteredResources = localResources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(search.toLowerCase()) ||
      (res.description && res.description.toLowerCase().includes(search.toLowerCase())) ||
      (res.tags && res.tags.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      statusFilter === "ALL" ? res.status !== "DELETED" : res.status === statusFilter;
    const matchesType = typeFilter === "ALL" || res.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4">
        {/* Top row — search + status + new button */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
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
              <option value="PENDING">Pending Approval</option>
              <option value="DELETED">Recycle Bin</option>
            </select>
            <Link href="/admin/resources/new" className="flex-1 sm:flex-none">
              <Button size="sm" className="gap-2 h-9 w-full">
                <PlusCircle className="h-4 w-4" /> New Resource
              </Button>
            </Link>
          </div>
        </div>

        {/* Type filter pills — second row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-nowrap">
          {TYPE_FILTERS.map((f) => {
            const Icon = f.icon;
            const isActive = typeFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => {
            const TypeIcon = TYPE_ICON_MAP[res.type] ?? FileText;
            const youtubeId = res.url?.match(
              /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
            )?.[1];
            const finalImageUrl =
              res.imageUrl ||
              (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null);

            return (
              <Card
                key={res.id}
                className="flex flex-col hover:border-primary/50 transition-colors overflow-hidden h-full"
              >
                {finalImageUrl && (
                  <div className="w-full aspect-video relative bg-muted flex items-center justify-center overflow-hidden border-b">
                    <img 
                      src={finalImageUrl} 
                      alt={res.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                )}
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between">
                    {/* Type badge with icon */}
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                      <TypeIcon className="h-3 w-3" />
                      {res.type}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${res.status === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : res.status === "DELETED"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                    >
                      {res.status === "PUBLISHED" ? "LIVE" : res.status === "DELETED" ? "DELETED" : "PENDING"}
                    </span>
                  </div>
                  <CardTitle className="text-lg mt-2 line-clamp-2">{res.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">{res.description}</CardDescription>
                  {res.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {res.tags.split(",").filter(Boolean).map((t: string) => (
                        <span key={t} className="text-[10px] items-center px-1.5 py-0.5 rounded-full font-semibold bg-primary/10 text-primary border border-primary/20">
                          #{t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-5 pt-0 mt-auto space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>By {res.author?.fullName || "Admin"}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 w-full border-t pt-3 border-muted/50">
                    <a href={res.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="h-8 w-8 px-1">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    {res.isRoadmapResource && (
                      <Link href={`/admin/modules/${res.stepId}`} className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full h-8 text-xs font-medium">
                          <Edit className="h-3 w-3 mr-1" /> Edit Module
                        </Button>
                      </Link>
                    )}

                    {res.isNote ? (
                      <Link href={`/notes/${res.id}`} className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full h-8 text-xs font-medium">
                          <Edit className="h-3 w-3 mr-1" /> View Note
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Link href={`/admin/resources/${res.id}`} className="flex-1">
                          <Button variant={res.isRoadmapResource ? "outline" : "secondary"} size="sm" className="w-full h-8 text-xs font-medium">
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(res.id, res.status)}
                          disabled={loadingId === res.id}
                          className="h-8 text-xs px-2"
                        >
                          {loadingId === res.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : res.status === "PUBLISHED" ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(res.id)}
                          disabled={loadingId === res.id}
                          className="h-8 text-xs px-2 text-destructive hover:bg-destructive/10 border-destructive/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed rounded-xl p-16 text-center bg-muted/10">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No resources found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Try resetting or modifying your search filters.
          </p>
        </div>
      )}
    </div>
  );
}

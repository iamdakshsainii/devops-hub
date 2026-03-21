"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, BarChart, Eye, FileText, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = ["ALL", "Linux", "Docker", "Kubernetes", "Git", "Terraform", "Ansible", "Helm", "AWS CLI", "Security", "CI/CD", "Monitoring", "Other"];

export function CheatsheetsClient({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = initialData.filter(item => {
     const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
     const matchesCategory = category === "ALL" || item.category === category;
     return matchesSearch && matchesCategory;
  }).sort((a, b) => {
     if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
     if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
     if (sort === "most-viewed") return b.viewCount - a.viewCount;
     return 0;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center bg-card p-4 rounded-xl border border-border/40 shadow-sm">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search cheatsheets..." 
            className="pl-9 h-9" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select value={category} onChange={e => setCategory(e.target.value)} className="h-9 px-3 border rounded-md bg-background text-sm flex-1 md:flex-none">
             {CATEGORIES.map(c => <option key={c} value={c}>{c === "ALL" ? "All Categories" : c}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} className="h-9 px-3 border rounded-md bg-background text-sm flex-1 md:flex-none">
             <option value="newest">Newest</option>
             <option value="oldest">Oldest</option>
             <option value="most-viewed">Most Viewed</option>
          </select>
          <div className="hidden sm:flex border rounded-md overflow-hidden">
             <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-none" onClick={() => setViewMode("grid")}>
                <LayoutGrid className="h-4 w-4" />
             </Button>
             <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-none" onClick={() => setViewMode("list")}>
                <List className="h-4 w-4" />
             </Button>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filtered.length} of {initialData.length} cheatsheets
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
           {filtered.map((item) => (
              <Card key={item.id} className="group flex flex-col hover:border-primary/50 transition-all duration-300 overflow-hidden bg-card/70 backdrop-blur-md relative h-full">
                 <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none bg-primary" />
                 
                 <CardHeader className="pb-3">
                     <div className="flex justify-between items-start mb-2">
                         <Badge variant="secondary" className="text-[10px] items-center font-bold px-2 py-0.5 rounded-full">
                             {item.category}
                         </Badge>
                         <span className="text-2xl">{item.icon}</span>
                     </div>
                     <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">{item.title}</CardTitle>
                     <CardDescription className="line-clamp-2 text-xs h-8">
                         {item.description || "Quick overview setup layout guide for references triggers."}
                     </CardDescription>
                 </CardHeader>

                 <CardContent className="flex-1 flex flex-col pt-0">
                     <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground mb-4">
                         <span className="flex items-center gap-1">
                             <Clock className="h-3.5 w-3.5" /> {item.readTime} min
                         </span>
                         <span className="flex items-center gap-1">
                             <BarChart className="h-3.5 w-3.5" /> {item.difficulty}
                         </span>
                         <span className="flex items-center gap-1">
                             <Eye className="h-3.5 w-3.5" /> {item.viewCount} Views
                         </span>
                     </div>

                     {item.tags && (
                         <div className="flex flex-wrap gap-1 mb-4">
                             {item.tags.split(",").filter(Boolean).map((t: string) => (
                                 <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/10">
                                     #{t.trim()}
                                 </span>
                             ))}
                         </div>
                     )}

                     <div className="mt-auto pt-4 border-t border-border/20">
                         <Link href={`/cheatsheets/${item.slug}`} className="w-full">
                             <Button variant="outline" size="sm" className="w-full gap-2 h-9 text-xs font-semibold text-foreground/80 hover:text-foreground">
                                 <FileText className="h-3.5 w-3.5" /> Read Cheatsheet
                             </Button>
                         </Link>
                     </div>
                 </CardContent>
              </Card>
           ))}
        </div>
      ) : (
        <div className="p-16 border border-dashed rounded-xl bg-muted/10 text-center">
            <p className="text-muted-foreground">No cheatsheets matching your filters.</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, BarChart, Eye, FileText, LayoutGrid, List, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";

const CATEGORIES = ["ALL", "Linux", "Docker", "Kubernetes", "Git", "Terraform", "Ansible", "Helm", "AWS CLI", "Security", "CI/CD", "Monitoring", "Other"];

export function CheatsheetsClient({ initialData }: { initialData: any[] }) {
  const { data: session } = useSession();
  const isAdmin = !!(session?.user && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role));

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
              <Link key={item.id} href={`/cheatsheets/${item.slug}`} className="block h-full group">
              <Card key={item.id} className="group flex flex-col backdrop-blur-xl border border-border/10 rounded-2xl overflow-hidden shadow-md hover:shadow-[0_25px_50px_rgba(0,0,0,0.15)] hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 bg-card/60 h-full relative">
                 <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none bg-primary" />

                 {item.coverImage && (
                     <div className="w-full h-48 bg-muted/30 overflow-hidden border-b border-border/10 relative flex items-center justify-center group/img">
                         <img 
                             src={item.coverImage} 
                             alt={item.title} 
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                         />
                         {isAdmin ? (
                            <div onClick={(e) => { e.stopPropagation(); e.preventDefault(); window.open(`/admin/cheatsheets?search=${encodeURIComponent(item.title)}`, '_blank'); }} className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                <Button size="sm" className="gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-black font-bold h-8 shadow-md">
                                    <FileText className="h-3.5 w-3.5" /> Edit Image
                                </Button>
                            </div>
                         ) : (
                            <div onClick={(e) => { e.stopPropagation(); e.preventDefault(); window.open(item.coverImage, '_blank'); }} className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity cursor-zoom-in">
                                <Button size="sm" variant="secondary" className="gap-1 text-xs font-bold h-7 px-2.5 backdrop-blur-md bg-background/80">
                                    View Full
                                </Button>
                            </div>
                         )}
                     </div>
                 )}
                  
                  <CardHeader className="pb-3 flex-1">
                      <div className="flex justify-between items-center mb-2">
                          <Badge variant="secondary" className="text-[10px] items-center font-bold px-2 py-0.5 rounded-full">
                              {item.category}
                          </Badge>
                          <span className="text-2xl">{item.icon}</span>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">{item.title}</CardTitle>
                      <CardDescription className="line-clamp-3 text-xs h-12">
                          {item.description || "Quick overview setup layout guide for references triggers."}
                      </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 flex flex-col mt-auto border-t border-border/20 p-4 bg-muted/5">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                              {item.author?.avatarUrl ? (
                                 <img src={item.author.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                              ) : (
                                 <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                                    {item.author?.fullName?.[0]?.toUpperCase() || "A"}
                                 </div>
                              )}
                              <span className="text-xs text-muted-foreground font-medium">{item.author?.fullName || "Admin"}</span>
                          </div>
                          <span className="text-xs text-muted-foreground/60">{new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mt-4 pt-3 border-t border-border/10">
                          <span className="flex items-center gap-1">
                               <Clock className="h-3 w-3" /> {item.readTime} min
                          </span>
                          <span className="flex items-center gap-1">
                               <BarChart className="h-3.5 w-3.5" /> {item.difficulty}
                          </span>
                          <span className="flex items-center gap-1">
                               <Eye className="h-3 w-3" /> {item.viewCount}
                          </span>
                      </div>

                      <div className="mt-4 block">
                          <Button variant="ghost" size="sm" className="w-full gap-1 h-8 text-xs font-semibold hover:bg-primary/5 group">
                              Read Cheatsheet <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                      </div>
                  </CardContent>
               </Card>
              </Link>
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

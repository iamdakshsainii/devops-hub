"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, Heart, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = ["ALL", "Docker", "Kubernetes", "Terraform", "Linux", "Security", "CI/CD", "MLOps", "AIOps", "SecOps", "Career", "General"];

export function BlogClient({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const filtered = initialData.filter(item => {
     const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          (item.excerpt && item.excerpt.toLowerCase().includes(search.toLowerCase()));
     const matchesCategory = category === "ALL" || item.category === category;
     return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-nowrap w-full md:w-auto">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                category === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              {c === "ALL" ? "All Posts" : c}
            </button>
          ))}
        </div>

        <div className="relative flex-1 w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search articles..." 
            className="pl-9 h-9" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filtered.length} of {initialData.length} articles
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {filtered.map((item) => {
              const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: "short", day: "numeric"
              });

              const formatReadTime = (mins: number) => {
                if (mins >= 43200) return `${Math.floor(mins / 43200)} mon`;
                if (mins >= 1440) return `${Math.floor(mins / 1440)} days`;
                if (mins >= 60) return `${Math.floor(mins / 60)} hr`;
                return `${mins} min`;
              };


              return (
              <Card key={item.id} className="group flex flex-col backdrop-blur-xl border border-border/10 rounded-2xl overflow-hidden shadow-md hover:shadow-[0_25px_50px_rgba(0,0,0,0.15)] hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 bg-card/60 h-full relative">
                 <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none bg-primary" />

                 {item.coverImage && (
                     <div className="w-full h-44 relative bg-muted overflow-hidden border-b border-border/10">
                         <img src={item.coverImage} alt={item.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                     </div>
                 )}
                 
                 <CardHeader className="pb-3 flex-1">
                     <div className="flex justify-between items-center mb-2">
                         <Badge variant="secondary" className="text-[10px] items-center font-bold px-2 py-0.5 rounded-full">
                             {item.category}
                         </Badge>
                     </div>
                     <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">{item.title}</CardTitle>
                     <CardDescription className="line-clamp-3 text-xs h-12">
                         {item.excerpt || "Quick articles supporting native triggers indexes setups."}
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
                         <span className="text-xs text-muted-foreground/60">{formattedDate}</span>
                     </div>

                     <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mt-4 pt-3 border-t border-border/10">
                         <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {formatReadTime(item.readTime)}
                         </span>
                         <div className="flex items-center gap-3">
                             <span className="flex items-center gap-1">
                                 <Heart className="h-3 w-3 text-red-500/80" /> {item.likeCount}
                             </span>
                             <span className="flex items-center gap-1">
                                 <MessageSquare className="h-3 w-3 text-blue-500/80" /> {item._count.comments}
                             </span>
                         </div>
                     </div>

                     <Link href={`/blog/${item.slug}`} className="mt-4 block">
                         <Button variant="ghost" size="sm" className="w-full gap-1 h-8 text-xs font-semibold hover:bg-primary/5 group">
                             Read Article <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                         </Button>
                     </Link>
                 </CardContent>
              </Card>
              );
           })}
        </div>
      ) : (
        <div className="p-16 border border-dashed rounded-xl bg-muted/10 text-center">
            <p className="text-muted-foreground">No articles matching your filters.</p>
        </div>
      )}
    </div>
  );
}

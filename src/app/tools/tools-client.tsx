"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, GitMerge, LayoutGrid, Award, Shield } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = ["ALL", "Containerization", "Orchestration", "CI/CD", "IaC", "Monitoring", "Logging", "Security", "Service Mesh", "GitOps", "MLOps", "Networking", "Other"];

export function ToolsClient({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const filtered = initialData.filter(item => {
     const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
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
              {c === "ALL" ? "All Tools" : c}
            </button>
          ))}
        </div>

        <div className="relative flex-1 w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tools..." 
            className="pl-9 h-9" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filtered.length} of {initialData.length} tools
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {filtered.map((item) => (
              <Card key={item.id} className="group flex flex-col hover:border-primary/50 transition-all duration-300 overflow-hidden bg-card/70 backdrop-blur-sm h-full relative">
                 <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none bg-primary" />

                 <CardHeader className="pb-3 text-center flex flex-col items-center">
                     <div className="h-16 w-16 rounded-2xl bg-muted/30 flex items-center justify-center text-3xl shadow-inner border border-border/10 mb-2 group-hover:scale-110 transition-transform duration-300">
                         {item.icon}
                     </div>
                     <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">{item.name}</CardTitle>
                     <Badge variant="secondary" className="text-[10px] items-center font-bold px-2 py-0.5 rounded-full mt-1">
                         {item.category}
                     </Badge>
                     <CardDescription className="line-clamp-2 text-xs h-8 mt-2">
                         {item.description || "Quick tools summary layout description reference triggers."}
                     </CardDescription>
                 </CardHeader>

                 <CardContent className="pt-0 flex flex-col mt-auto border-t border-border/20 p-4 bg-muted/5 space-y-4">
                     <div className="flex items-center justify-center gap-4 text-xs font-semibold text-muted-foreground">
                         <span className="flex items-center gap-1"><Award className="h-3 w-3 text-amber-500" /> {item.difficulty}</span>
                         <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                         <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-blue-500" /> {item.license}</span>
                     </div>

                     <div className="grid grid-cols-2 gap-2 mt-auto">
                         <Link href={`/tools/${item.slug}`} className="w-full">
                             <Button variant="outline" size="sm" className="w-full h-8 text-xs font-semibold">
                                 View Details
                             </Button>
                         </Link>
                         <Link href={`/tools/compare?tool=${item.slug}`} className="w-full">
                             <Button variant="ghost" size="sm" className="w-full h-8 text-xs font-semibold gap-1 text-primary hover:bg-primary/5">
                                 <GitMerge className="h-3.5 w-3.5" /> Compare
                             </Button>
                         </Link>
                     </div>
                 </CardContent>
              </Card>
           ))}
        </div>
      ) : (
        <div className="p-16 border border-dashed rounded-xl bg-muted/10 text-center">
            <p className="text-muted-foreground">No tools matching your filters.</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Layers, Library, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ModulesPageClient({ data }: { data: any[] }) {
  const [search, setSearch] = useState("");
  const [selectedRoadmap, setSelectedRoadmap] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST" | "TOPICS_DESC" | "TOPICS_ASC">("NEWEST");

  // Get unique roadmaps for filtering
  const roadmapTitles = Array.from(new Set(data.map(m => m.roadmapTitle)));

  const filteredModules = data
    .filter(mod => {
      const matchesSearch = mod.title.toLowerCase().includes(search.toLowerCase()) || 
                           (mod.description && mod.description.toLowerCase().includes(search.toLowerCase()));
      const matchesRoadmap = !selectedRoadmap || mod.roadmapTitle === selectedRoadmap;
      return matchesSearch && matchesRoadmap;
    })
    .sort((a, b) => {
      if (sortBy === "NEWEST") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "OLDEST") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "TOPICS_DESC") return b._count.topics - a._count.topics;
      if (sortBy === "TOPICS_ASC") return a._count.topics - b._count.topics;
      return 0;
    });

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl space-y-12">
      <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center rounded-full border bg-muted/30 px-3 py-1 text-xs text-foreground/80 shadow-sm backdrop-blur-md mb-2">
           <Library className="h-3.5 w-3.5 mr-2 text-primary" />
           {filteredModules.length} Modules Available
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Explore Modules</h1>
        <p className="text-lg text-muted-foreground">
          Dive directly into any specific technology, tool, or concept without following a full roadmap. Pick a module below and start learning instantly.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
         {/* Left Sidebar Filter Section */}
         <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 space-y-6 md:sticky md:top-24">
            <div className="bg-muted/30 p-5 rounded-2xl border backdrop-blur-sm space-y-5">
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Search</label>
                  <div className="relative">
                     <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input 
                       placeholder="Filter modules..." 
                       className="pl-9 bg-background/80" 
                       value={search}
                       onChange={e => setSearch(e.target.value)}
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sort By</label>
                  <select 
                     value={sortBy} 
                     onChange={e => setSortBy(e.target.value as any)}
                     className="flex h-9 w-full rounded-md border border-input bg-background/80 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                     <option value="NEWEST">Newest Added</option>
                     <option value="OLDEST">Oldest Added</option>
                     <option value="TOPICS_DESC">Most topics first</option>
                     <option value="TOPICS_ASC">Least topics first</option>
                  </select>
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Track / Domain</label>
                  <div className="flex flex-col gap-1">
                     <Button 
                        variant={selectedRoadmap === null ? "secondary" : "ghost"} 
                        size="sm"
                        onClick={() => setSelectedRoadmap(null)}
                        className="justify-start font-medium text-sm h-9"
                     >
                        All Tracks
                     </Button>
                     {roadmapTitles.map(title => (
                        <Button 
                           key={title}
                           variant={selectedRoadmap === title ? "secondary" : "ghost"} 
                           size="sm"
                           onClick={() => setSelectedRoadmap(title)}
                           className="justify-start font-medium text-sm h-9 truncate"
                        >
                           {title}
                        </Button>
                     ))}
                  </div>
               </div>
            </div>
         </aside>

         {/* Right Main Grid Section */}
         <div className="flex-1">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.length > 0 ? (
                 filteredModules.map(mod => (
                    <Link key={mod.id} href={`/roadmap/${mod.roadmapId}/${mod.id}`} className="group block h-full">
                       <Card className="h-full hover:shadow-xl hover:border-foreground/30 transition-all duration-300 relative overflow-hidden flex flex-col items-start bg-card">
                          {/* Hover Tint */}
                          <div className="absolute top-0 left-0 w-1.5 h-full opacity-60 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: mod.roadmapColor }} />
                          
                          <CardHeader className="pl-6 w-full pb-3 border-b border-border/10">
                             <div className="flex justify-between items-start mb-3">
                               <div className="text-3xl bg-muted/50 p-3 rounded-2xl shadow-sm border border-border/50 group-hover:bg-primary/5 transition-colors">
                                 {mod.icon}
                               </div>
                               <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider rounded-md border-border/40 text-muted-foreground/80 bg-background/50">
                                  {mod.roadmapTitle}
                               </Badge>
                             </div>
                             <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">{mod.title}</CardTitle>
                          </CardHeader>
                          
                          <CardContent className="pl-6 pt-4 flex-1 flex flex-col min-h-0 w-full mb-auto pb-6">
                             <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-3 mb-6 flex-1">
                                {mod.description || "Explore this module to view its curated topics and community resources."}
                             </p>
                             <div className="flex items-center gap-4 mt-auto text-xs font-semibold text-muted-foreground pt-4 border-t border-border/30">
                                <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded">
                                   <BookOpen className="h-3.5 w-3.5" style={{ color: mod.roadmapColor }}/>
                                   {mod._count.topics} Topics
                                </span>
                                <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded">
                                   <Layers className="h-3.5 w-3.5" style={{ color: mod.roadmapColor }}/>
                                   {mod._count.resources} Resources
                                </span>
                             </div>
                          </CardContent>
                       </Card>
                    </Link>
                 ))
              ) : (
                 <div className="col-span-full border border-dashed rounded-2xl p-24 text-center bg-muted/10">
                    <Library className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">No Modules Found</h2>
                    <p className="text-muted-foreground">Try adjusting your search or filter configuration.</p>
                 </div>
              )}
            </div>
         </div>
      </div>
    </div>
  );
}

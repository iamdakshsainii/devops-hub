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

  // Get unique roadmaps for filtering
  const roadmapTitles = Array.from(new Set(data.map(m => m.roadmapTitle)));

  const filteredModules = data.filter(mod => {
    const matchesSearch = mod.title.toLowerCase().includes(search.toLowerCase()) || 
                         (mod.description && mod.description.toLowerCase().includes(search.toLowerCase()));
    const matchesRoadmap = !selectedRoadmap || mod.roadmapTitle === selectedRoadmap;
    return matchesSearch && matchesRoadmap;
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
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

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-2xl border backdrop-blur-sm max-w-3xl mx-auto w-full">
         <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by topic, tool or concept..." 
              className="pl-9 bg-background/80" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Button 
               variant={selectedRoadmap === null ? "default" : "outline"} 
               size="sm"
               onClick={() => setSelectedRoadmap(null)}
               className="rounded-full h-9 whitespace-nowrap"
            >
               All
            </Button>
            {roadmapTitles.map(title => (
               <Button 
                  key={title}
                  variant={selectedRoadmap === title ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedRoadmap(title)}
                  className="rounded-full h-9 whitespace-nowrap"
               >
                  {title}
               </Button>
            ))}
         </div>
      </div>

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
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Layers, Library, Search, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ModulesPageClient({ data }: { data: any[] }) {
   const [search, setSearch] = useState("");
   const [selectedRoadmap, setSelectedRoadmap] = useState<string | null>(null);
   const [typeFilter, setTypeFilter] = useState<"ALL" | "ROADMAP" | "STANDALONE">("ALL");
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
   const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST" | "TOPICS_DESC" | "TOPICS_ASC">("NEWEST");
   const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
   const [completionFilter, setCompletionFilter] = useState<"ALL" | "NEW" | "IN_PROGRESS" | "COMPLETED">("ALL");
   const cyclingColors = ["#3b82f6", "#f97316", "#8b5cf6", "#10b981", "#ec4899", "#14b8a6"];

   // Get unique roadmaps for filtering
   const roadmapTitles = Array.from(new Set(data.map(m => m.roadmapTitle).filter(Boolean)));

   const filteredModules = data
      .filter(mod => {
         const matchesSearch = mod.title.toLowerCase().includes(search.toLowerCase()) ||
            (mod.description && mod.description.toLowerCase().includes(search.toLowerCase())) ||
            (mod.tags && mod.tags.toLowerCase().includes(search.toLowerCase()));
         const modRoadmap = mod.roadmapTitle || "Standalone";
         const matchesRoadmap = !selectedRoadmap || modRoadmap === selectedRoadmap;
         const matchesType = typeFilter === "ALL"
            ? true
            : typeFilter === "ROADMAP"
               ? !!mod.roadmapId
               : !mod.roadmapId;
         const matchesDifficulty = difficultyFilter === "ALL" || (mod.tags && mod.tags.toLowerCase().includes(difficultyFilter.toLowerCase()));
         
         const matchesCompletion = 
            completionFilter === "ALL" ? true :
            completionFilter === "COMPLETED" ? (mod.trackingTotal > 0 && mod.trackingCompleted === mod.trackingTotal) :
            completionFilter === "IN_PROGRESS" ? (mod.trackingCompleted > 0 && mod.trackingCompleted < mod.trackingTotal) :
            completionFilter === "NEW" ? (mod.trackingCompleted === 0) :
            true;

         return matchesSearch && matchesRoadmap && matchesType && matchesDifficulty && matchesCompletion;
      })
      .sort((a, b) => {
         if (sortBy === "NEWEST") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
         if (sortBy === "OLDEST") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
         if (sortBy === "TOPICS_DESC") return b._count.topics - a._count.topics;
         if (sortBy === "TOPICS_ASC") return a._count.topics - b._count.topics;
         return 0;
      });

   return (
      <div className={`w-full mx-auto px-4 py-12 ${sidebarCollapsed ? "max-w-none px-8" : "max-w-7xl"} space-y-12 transition-all duration-300`}>
         <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center rounded-full border bg-muted/30 px-3 py-1 text-xs text-foreground/80 shadow-sm backdrop-blur-md mb-2">
               <Library className="h-3.5 w-3.5 mr-2 text-primary" />
               {filteredModules.length} Modules Available
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Explore Modules</h1>
            <p className="text-lg text-muted-foreground">
               Dive directly into any specific technology, tool, or concept without following a full roadmap. Pick a module below and start learning instantly.
            </p>
            <div className="flex bg-muted/40 backdrop-blur-sm p-1 rounded-xl w-full max-w-md mx-auto border justify-center items-center gap-1 shadow-sm mt-4">
               <button
                  onClick={() => setTypeFilter("ALL")}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${typeFilter === "ALL" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
               >
                  All
               </button>
               <button
                  onClick={() => setTypeFilter("ROADMAP")}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${typeFilter === "ROADMAP" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
               >
                  Roadmap Tracks
               </button>
               <button
                  onClick={() => setTypeFilter("STANDALONE")}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${typeFilter === "STANDALONE" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
               >
                  Standalone / Tools
               </button>
            </div>
            
            <div className="flex items-center justify-center gap-2 flex-wrap mt-4">
              {[
                { key: "ALL", label: "All", icon: "◈" },
                { key: "NEW", label: "New", icon: "✦" },
                { key: "IN_PROGRESS", label: "In Progress", icon: "⬡" },
                { key: "COMPLETED", label: "Completed", icon: "✓" },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setCompletionFilter(key as any)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    completionFilter === key
                      ? key === "COMPLETED"
                        ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                        : key === "IN_PROGRESS"
                        ? "bg-orange-500/15 text-orange-600 border-orange-500/30"
                        : key === "NEW"
                        ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
                        : "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>
         </div>

         <div className="flex items-center gap-2 md:hidden mb-4">
            <Button variant="outline" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-full gap-2 rounded-xl">
               <SlidersHorizontal className="h-4 w-4" />
               {sidebarCollapsed ? "Show Filters" : "Hide Filters"}
            </Button>
         </div>

         <div className="flex flex-col md:flex-row gap-8 items-start relative transition-all duration-300">
            {!sidebarCollapsed && (
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
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Difficulty</label>
                        <select
                           value={difficultyFilter}
                           onChange={e => setDifficultyFilter(e.target.value)}
                           className="flex h-9 w-full rounded-md border border-input bg-background/80 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                           <option value="ALL">All Levels</option>
                           <option value="BEGINNER">Beginner</option>
                           <option value="INTERMEDIATE">Intermediate</option>
                           <option value="ADVANCED">Advanced</option>
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
            )}

            {/* Right Main Grid Section */}
            <div className="flex-1">
               <div className="flex justify-between items-center mb-5">
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                     className="gap-2 hidden md:inline-flex bg-muted/40 backdrop-blur-sm border-muted-foreground/20 hover:bg-muted/80 rounded-xl"
                  >
                     <SlidersHorizontal className="h-4 w-4" />
                     {sidebarCollapsed ? "Expand Filters" : "Collapse Filters"}
                  </Button>
                  <div className="hidden md:block text-xs text-muted-foreground font-semibold">
                     Found {filteredModules.length} Modules
                  </div>
               </div>
               <div className={`grid grid-cols-1 sm:grid-cols-2 ${sidebarCollapsed ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-6 transition-all duration-300`}>
                  {filteredModules.length > 0 ? (
                     filteredModules.map((mod, index) => {
                        const isModuleComplete = mod.trackingTotal > 0 && mod.trackingCompleted === mod.trackingTotal;
                        return (
                        <Link
                           key={mod.id}
                           href={mod.isStandalone ? `/modules/${mod.id}` : `/roadmap/${mod.roadmapId}/${mod.id}`}
                           className="group block h-full"
                        >
                           <Card className={`h-full hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col items-start ${
                                 isModuleComplete 
                                   ? "bg-emerald-50/60 dark:bg-emerald-500/[0.03] border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-400/50" 
                                   : "bg-card hover:border-foreground/30"
                              }`}>
                              {/* Backlight Glow Animation */}
                              <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-0 group-hover:opacity-25 transition-all duration-300 pointer-events-none" style={{ backgroundColor: cyclingColors[index % cyclingColors.length] }} />
                              {/* Hover Tint */}
                              <div className="absolute top-0 left-0 w-1.5 h-full opacity-80 transition-opacity" style={{ backgroundColor: isModuleComplete ? "#10b981" : cyclingColors[index % cyclingColors.length] }} />
                              {isModuleComplete && (
                                 <div className="absolute bottom-4 right-4 opacity-[0.07] pointer-events-none select-none">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                       <path d="M20 6L9 17l-5-5"/>
                                    </svg>
                                 </div>
                              )}

                              <CardHeader className="pl-6 w-full pb-3 border-b border-border/10">
                                 <div className="flex justify-between items-start mb-3">
                                    <div className="text-3xl bg-muted/50 p-3 rounded-2xl shadow-sm border border-border/50 group-hover:bg-primary/5 transition-colors">
                                       {mod.icon}
                                    </div>
                                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider rounded-md border-border/40 text-muted-foreground/80 bg-background/50">
                                       {mod.roadmapTitle}
                                    </Badge>
                                 </div>
                                 <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2 h-14 font-bold flex items-center leading-tight mb-1">{mod.title}</CardTitle>
                              </CardHeader>

                              <CardContent className="pl-6 pt-4 flex-1 flex flex-col min-h-0 w-full mb-auto pb-6">
                                 <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-3 mb-6 flex-1">
                                    {mod.description || "Explore this module to view its curated topics and community resources."}
                                 </p>

                                 {mod.tags && (
                                    <div className="flex flex-wrap gap-1 mt-auto mb-4">
                                       {mod.tags.split(",").map((t: string) => (
                                          <div key={t} className="text-[10px] bg-muted/40 text-muted-foreground/80 px-1.5 py-0.5 rounded border border-border/20 font-semibold">
                                             {t.trim()}
                                          </div>
                                       ))}
                                    </div>
                                 )}
                                 <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground pt-4 border-t border-border/30 w-full">
                                    {isModuleComplete ? (
                                       <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">
                                          ✓ {mod.trackingCompleted} / {mod.trackingTotal} Topics Done
                                       </span>
                                    ) : (
                                       <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50">
                                          <BookOpen className="h-3.5 w-3.5" style={{ color: cyclingColors[index % cyclingColors.length] }} />
                                          {mod.trackingTotal > 0 ? `${mod.trackingCompleted} / ${mod.trackingTotal} Topics` : `${mod._count.topics} Topics`}
                                       </span>
                                    )}
                                    <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded">
                                       <Layers className="h-3.5 w-3.5" style={{ color: cyclingColors[index % cyclingColors.length] }} />
                                       {mod._count.resources} Resources
                                    </span>
                                    {isModuleComplete && (
                                       <span className="ml-auto text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                          Review →
                                       </span>
                                    )}
                                 </div>
                              </CardContent>
                           </Card>
                        </Link>
                     )})
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

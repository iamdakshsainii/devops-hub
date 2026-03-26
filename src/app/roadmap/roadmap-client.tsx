"use client";

import { useState } from "react";
import { Search, Clock, LayoutGrid, SlidersHorizontal, ChevronDown, BookOpen, FileText, ArrowRight, Edit, Map } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface RoadmapClientProps {
  roadmaps: any[];
  isAdmin: boolean;
  q: string;
  sort: string;
  steps: string;
  SORTS: any[];
  STEP_BUCKETS: any[];
}

export default function RoadmapClient({ roadmaps, isAdmin, q, sort, steps, SORTS, STEP_BUCKETS }: RoadmapClientProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filtersContent = (
    <form method="GET" action="/roadmap" className="space-y-5">
      <Card className="backdrop-blur-md bg-card/60 shadow-md border-border/10 rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <Search className="h-4 w-4 text-primary" /> Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            name="q"
            placeholder="Search paths..."
            defaultValue={q}
            className="h-9 text-sm"
          />
          {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
          {steps !== "all" && <input type="hidden" name="steps" value={steps} />}
        </CardContent>
      </Card>

      <Card className="backdrop-blur-md bg-card/60 shadow-md border-border/10 rounded-2xl">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-purple-500" /> Sort By
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 flex flex-col gap-1">
          {SORTS.map((s) => (
            <Link
              key={s.value}
              href={`/roadmap?sort=${s.value}${q ? `&q=${encodeURIComponent(q)}` : ""}${steps !== "all" ? `&steps=${steps}` : ""}`}
              className={`text-xs px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                sort === s.value
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="backdrop-blur-md bg-card/60 shadow-md border-border/10 rounded-2xl">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <LayoutGrid className="h-4 w-4 text-blue-500" /> Path Length
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 flex flex-col gap-1">
          {STEP_BUCKETS.map((s) => (
            <Link
              key={s.value}
              href={`/roadmap?steps=${s.value}${q ? `&q=${encodeURIComponent(q)}` : ""}${sort !== "newest" ? `&sort=${sort}` : ""}`}
              className={`text-xs px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                steps === s.value
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </CardContent>
      </Card>
      
      {/* Mobile-only Apply Button */}
      <div className="lg:hidden pt-2">
         <Button type="submit" className="w-full rounded-xl font-bold">Apply Filters</Button>
      </div>
    </form>
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Toggle */}
        <div className="lg:hidden w-full">
          <Button 
            variant="outline" 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex justify-between items-center rounded-2xl h-12 px-6 border-border/10 bg-card/40 backdrop-blur-md group"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm uppercase tracking-tight">Search & Filters</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`} />
          </Button>
          
          <div className={`overflow-hidden transition-all duration-300 ${isFilterOpen ? "max-h-[1000px] mt-6 opacity-100" : "max-h-0 opacity-0"}`}>
             {filtersContent}
          </div>
        </div>

        {/* Sidebar Area - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-5">
           {filtersContent}
        </aside>

        {/* Grid Content Area */}
        <div className="flex-1">
          {roadmaps.length > 0 ? (
            <div className="space-y-8">
              {roadmaps.map((roadmap) => (
                <div key={roadmap.id} className="block group">
                  <div className="relative backdrop-blur-xl bg-card/60 border border-border/10 rounded-2xl overflow-hidden shadow-md hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)] hover:border-primary/30 transition-all duration-500 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-0 group-hover:opacity-10 transition-all duration-700 blur-3xl pointer-events-none" style={{ backgroundColor: roadmap.color }} />
                    <div className="h-1 w-full" style={{ backgroundColor: roadmap.color, opacity: 0.8 }} />

                    <div className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl h-12 w-12 rounded-xl flex items-center justify-center border shadow-sm shrink-0" style={{ backgroundColor: `${roadmap.color}15` }}>
                            {roadmap.icon}
                          </div>
                          <div>
                            <h2 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                              <Link href={`/roadmap/${roadmap.id}`} className="hover:underline">
                                {roadmap.title}
                              </Link>
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 md:line-clamp-1">
                              {roadmap.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          {isAdmin && (
                            <Link href={`/admin/roadmaps?search=${encodeURIComponent(roadmap.title)}`} target="_blank" className="flex-1 md:flex-none">
                               <Button variant="outline" size="sm" className="rounded-full h-8 text-xs font-bold gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border-amber-500/20 shadow-sm w-full">
                                 <Edit className="h-3.5 w-3.5" /> Edit
                               </Button>
                            </Link>
                          )}
                          <Link href={`/roadmap/${roadmap.id}`} className="flex-1 md:flex-none">
                            <Button variant="ghost" size="sm" className="rounded-full gap-1.5 group-hover:bg-primary group-hover:text-primary-foreground transition-all w-full">
                              Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {roadmap.steps.length > 0 && (
                        <div className="relative pt-4 pb-4 overflow-x-auto scrollbar-hide md:scrollbar-default">
                           <div className="relative" style={{ minWidth: `max(100%, ${roadmap.steps.length * 65}px)` }}>
                              <div 
                                className="absolute top-4 left-6 right-6 h-1 rounded-full bg-gradient-to-r" 
                                style={{ backgroundImage: `linear-gradient(to right, ${roadmap.color}, ${roadmap.color}40)` }} 
                              />
                              <div className="relative flex justify-between">
                                {roadmap.steps.map((step: any, i: number) => (
                                  <div key={step.id} className="flex flex-col items-center relative z-10 shrink-0" style={{ width: roadmap.steps.length > 8 ? '65px' : `${100 / roadmap.steps.length}%`, minWidth: '65px' }}>
                                    <div className="relative group/dot flex items-center justify-center">
                                      <div className="absolute inset-0 rounded-full scale-125 blur-sm opacity-60 group-hover/dot:scale-150 transition-all duration-300" style={{ backgroundColor: `${roadmap.color}40` }} />
                                      <div
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background flex items-center justify-center text-[10px] md:text-xs font-black text-white shadow-md relative group-hover/dot:scale-110 transition-transform duration-300 shrink-0"
                                        style={{ backgroundColor: roadmap.color }}
                                      >
                                        {String(i + 1).padStart(2, "0")}
                                      </div>
                                    </div>
                                    <span className="text-[9px] md:text-[11px] font-semibold mt-2.5 text-center line-clamp-1 max-w-[60px] md:max-w-[90px] text-foreground/80 group-hover:text-primary transition-colors">
                                      {step.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                           </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-muted-foreground">
                        <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/20">
                          <BookOpen className="h-3.5 w-3.5" style={{ color: roadmap.color }} /> 
                          <span>{roadmap.steps.length} Steps</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/20">
                          <FileText className="h-3.5 w-3.5" style={{ color: `${roadmap.color}bb` }} /> 
                          <span>{roadmap.steps.reduce((s: any, st: any) => s + st._count.topics, 0)} Topics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl bg-muted/20 border-dashed">
              <Map className="h-10 w-10 text-muted-foreground/40 mb-4" />
              <h2 className="text-xl font-bold mb-1">No matching paths</h2>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search criteria in the left sidebar.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
